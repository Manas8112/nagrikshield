import { NextResponse } from 'next/server';
import { getVisionPipeline } from '../../lib/visionServer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { image, prompts } = await request.json();

    if (!image || !prompts || !prompts.length) {
      return NextResponse.json({ error: 'Missing image or prompts' }, { status: 400 });
    }

    // Load the globally cached CLIP model
    const classifier = await getVisionPipeline();

    // The image can be a data URL or an external URL. 
    // Transformers.js needs a file path or URL in Node.js.
    let imgInput = image;
    let tempFilePath = null;
    if (image.startsWith('data:')) {
      const base64Data = image.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const tempDir = path.join(process.cwd(), '.temp_vision');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
      tempFilePath = path.join(tempDir, `img_${crypto.randomUUID()}.jpg`);
      fs.writeFileSync(tempFilePath, buffer);
      imgInput = tempFilePath;
    }

    const output = await classifier(imgInput, prompts);

    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    // output is typically an array of objects: { label: '...', score: 0.99 }
    return NextResponse.json({ result: output });

  } catch (error) {
    console.error('Vision API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
