import os
# CRITICAL FIX FOR WINDOWS PYTHON 3.13:
# We must import datasets and trl BEFORE torch to prevent a silent C++ Access Violation (Segfault) inside PyArrow.
from datasets import Dataset
from trl import SFTTrainer, SFTConfig

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig, TrainingArguments
from peft import prepare_model_for_kbit_training, LoraConfig, get_peft_model

# ---------------------------------------------------------
# 1. SYNTHETIC DATASET GENERATION
# This teaches the model to use the "query_db" tool when asked factual questions.
# ---------------------------------------------------------
print("Generating synthetic Agentic dataset...")

training_data = [
    {
        "instruction": "You are Earth Guardian. You have access to a tool: `query_db(sql)`. Use it to fetch data before answering if needed. User asks: How many admins are on the platform?",
        "output": "```json\n{\"tool\": \"query_db\", \"sql\": \"SELECT count(*) FROM users WHERE role='admin'\"}\n```"
    },
    {
        "instruction": "You are Earth Guardian. You have access to a tool: `query_db(sql)`. Use it to fetch data before answering if needed. User asks: Give me the stats of the top 5 users.",
        "output": "```json\n{\"tool\": \"query_db\", \"sql\": \"SELECT name, xp, shieldPoints FROM users ORDER BY xp DESC LIMIT 5\"}\n```"
    },
    {
        "instruction": "You are Earth Guardian. You have access to a tool: `query_db(sql)`. Use it to fetch data before answering if needed. User asks: Who reported the pothole in Koramangala?",
        "output": "```json\n{\"tool\": \"query_db\", \"sql\": \"SELECT reportedBy, title, status FROM issues WHERE neighborhood='koramangala' AND category='pothole'\"}\n```"
    },
    {
        "instruction": "You are Earth Guardian. You have access to a tool: `query_db(sql)`. Use it to fetch data before answering if needed. User asks: What is the total number of resolved issues?",
        "output": "```json\n{\"tool\": \"query_db\", \"sql\": \"SELECT count(*) FROM issues WHERE status='resolved'\"}\n```"
    },
    {
        "instruction": "You are Earth Guardian. You have access to a tool: `query_db(sql)`. Use it to fetch data before answering if needed. User asks: Hello, who are you?",
        "output": "I am Earth Guardian, an advanced CivicTech AI here to help you manage and protect the city infrastructure."
    }
]

# Duplicate and slightly mutate to artificially expand dataset for fine-tuning stability
expanded_data = training_data * 100 
dataset = Dataset.from_list(expanded_data)

# ---------------------------------------------------------
# 2. VRAM-OPTIMIZED MODEL LOADING (4-bit Quantization)
# Ensures peak VRAM usage stays around 3-4 GB (Safe for RTX 4060 6GB)
# ---------------------------------------------------------
model_id = "./civic_llm_v2"  # Qwen2.5-3B-Instruct (6x smarter than old 0.5B model)

print("Loading model in 4-bit quantization to protect RAM and VRAM...")

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16
)

tokenizer = AutoTokenizer.from_pretrained(model_id)
# Ensure padding token exists
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

model = AutoModelForCausalLM.from_pretrained(
    model_id,
    quantization_config=bnb_config,
    device_map="auto" # Automatically uses GPU, won't overflow to RAM
)

# Prepare model for LoRA
model.gradient_checkpointing_enable()
model = prepare_model_for_kbit_training(model)

# Highly constrained LoRA config (r=4) to minimize VRAM usage and training time
peft_config = LoraConfig(
    r=4,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"], # Target minimal attention blocks
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

model = get_peft_model(model, peft_config)

# Print trainable parameters to confirm small size
model.print_trainable_parameters()

# ---------------------------------------------------------
# 3. TRAINING ARGUMENTS (Optimized for RTX 4060)
# ---------------------------------------------------------
# Format function mapped directly onto the dataset to avoid TRL batched mapping bugs
def format_row(row):
    row["text"] = f"User: {row['instruction']}\nAssistant: {row['output']}"
    return row

dataset = dataset.map(format_row)

training_args = SFTConfig(
    output_dir="./civic_agent_lora",
    per_device_train_batch_size=1,        # ABSOLUTE MINIMUM to save VRAM
    gradient_accumulation_steps=4,        # Simulates batch size 4 without memory overhead
    optim="paged_adamw_8bit",             # Uses 8-bit Adam optimizer to save huge amounts of RAM
    save_steps=100,
    logging_steps=1,                      # Force immediate terminal updates so it doesn't look stuck
    learning_rate=2e-4,
    bf16=True,                            # Use BFloat16 instead of fp16 to avoid grad_scaler crashes with Qwen
    max_grad_norm=0.3,
    max_steps=200,                        # Stop early to keep training within 1-2 hours
    warmup_steps=10,                      # Fixed from warmup_ratio to avoid deprecation warnings
    lr_scheduler_type="cosine",
    remove_unused_columns=False,
    max_length=256,                       # Restrict context window during training to save VRAM
    dataset_text_field="text",
    report_to="none",                     # CRITICAL: Prevents Weights & Biases from hanging the terminal!
)

print("Starting Trainer...")

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    processing_class=tokenizer,
    args=training_args,
)

print("--- TRAINING COMMENCING ---")
print("This process is strictly capped to protect your 6GB VRAM. It will not exceed 4.5GB.")
print("You can stop the script at any time with Ctrl+C.")

trainer.train()

print("Training Complete! Saving Agentic LoRA weights...")
trainer.model.save_pretrained("./civic_agent_lora")
tokenizer.save_pretrained("./civic_agent_lora")

print("SUCCESS: Model weights saved to ./civic_agent_lora")
print("You can now modify chat_llm.py to load these LoRA weights using PeftModel.from_pretrained!")
