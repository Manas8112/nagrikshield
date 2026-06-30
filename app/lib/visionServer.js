import { pipeline, env } from '@xenova/transformers';

// Skip local check, we only want to fetch from huggingface
env.allowLocalModels = false;

// We use global to persist the model across Next.js fast-refresh in dev mode.
const globalForVision = globalThis;

if (!globalForVision.clipPipeline) {
  globalForVision.clipPipeline = null;
}

export async function getVisionPipeline() {
  if (!globalForVision.clipPipeline) {
    console.log('🚀 Initializing OpenAI CLIP Model (this happens once on server start)...');
    globalForVision.clipPipeline = pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32');
  }
  return await globalForVision.clipPipeline;
}

// Preload the heavy CLIP model immediately in the background so it's instantly ready when a user uploads an image!
if (typeof window === 'undefined') {
  getVisionPipeline().catch(e => console.error("Vision preload error:", e));
}
