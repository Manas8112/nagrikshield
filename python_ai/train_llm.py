import json
import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, Trainer, TrainingArguments, DataCollatorForLanguageModeling
from datasets import Dataset

def train_llm():
    print("Loading intents dataset for LLM fine-tuning...")
    with open('intents.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Convert intent JSON into conversational format for Causal LM
    conversations = []
    
    # Simple mapping of intents to LLM training responses
    responses = {
        "GREETING": "Hello! I am the CivicTech Assistant. I can help you report issues, understand the Cascade ROI, or explain your Shield Points.",
        "REPORT_ISSUE": "To report an issue, please navigate to the Report page. The Cascade Engine will predict the risk severity of issues like potholes or water leaks.",
        "CHECK_STATUS": "You can check the live status of your reports directly from your Profile Dashboard.",
        "ECONOMY_SP": "Shield Points (SP) are your civic stake. When you report, you stake SP. If verified, you earn it back with a multiplier. Fake reports lose their stake.",
        "ECONOMY_XP": "Experience Points (XP) track your civic impact. Earn XP by reporting, validating, and completing Command Quests.",
        "CASCADE_ROI": "The Cascade Engine calculates the future financial and civic cost of an issue if left unresolved. Fixing it early provides massive ROI.",
        "SWARM_VALIDATION": "Swarm Validation prevents fake reports. Multiple citizens must verify an issue geographically to reach 85% Swarm Confidence before dispatch.",
        "AI_SYSTEM": "We use a 4-Layer Fusion AI including Semantic CNNs and Geo-Temporal heuristics to compute unique Issue DNA."
    }

    print("Loading base model (Qwen2.5-0.5B-Instruct)...")
    model_name = "Qwen/Qwen2.5-0.5B-Instruct"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    for item in data:
        intent = item['intent']
        target_response = responses.get(intent, "I can assist you with civic reporting.")
        for example in item['examples']:
            messages = [
                {"role": "system", "content": "You are the CivicTech Assistant. You must provide factual civic answers."},
                {"role": "user", "content": example},
                {"role": "assistant", "content": target_response}
            ]
            text = tokenizer.apply_chat_template(messages, tokenize=False)
            conversations.append({"text": text})

    # Create HuggingFace Dataset
    dataset = Dataset.from_list(conversations)

    def tokenize_function(examples):
        return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)

    print("Tokenizing dataset...")
    tokenized_datasets = dataset.map(tokenize_function, batched=True)

    model = AutoModelForCausalLM.from_pretrained(model_name)

    data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

    print(f"Device: {'GPU' if torch.cuda.is_available() else 'CPU'}")

    training_args = TrainingArguments(
        output_dir="./civic_llm",
        num_train_epochs=3,
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        learning_rate=3e-5,
        weight_decay=0.01,
        fp16=torch.cuda.is_available(), # Use mixed precision on RTX GPUs
        save_steps=1000,
        save_total_limit=2,
        logging_steps=10,
        logging_dir='./logs',
        optim="adamw_torch",
        report_to="none" # disable wandb/etc
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        data_collator=data_collator,
        train_dataset=tokenized_datasets,
    )

    print("Starting fine-tuning process... This might take some time depending on your hardware.")
    trainer.train()

    print("Training complete! Saving model...")
    trainer.save_model("./civic_llm_model")
    tokenizer.save_pretrained("./civic_llm_model")
    print("Model saved to ./civic_llm_model successfully.")

if __name__ == "__main__":
    train_llm()
