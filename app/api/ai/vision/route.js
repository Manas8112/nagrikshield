import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

// Increase max body size since we are receiving base64 image strings
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic';

function runVisionML(originalImage, proofImage, title, description) {
  return new Promise((resolve, reject) => {
    const pythonScriptDir = path.join(process.cwd(), 'python_ai');
    const pythonScriptPath = path.join(pythonScriptDir, 'verify_vision.py');
    
    // We pass the base64 strings directly to python as arguments. 
    // Note: Windows CMD has an argument length limit of 8191 characters. 
    // For large base64 strings, this can crash `spawn`. 
    // To fix this, we will write them to a temp file and pass the paths.
    
    const fs = require('fs');
    const crypto = require('crypto');
    
    const tempDir = path.join(pythonScriptDir, 'temp_images');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    
    const id = crypto.randomUUID();
    const origPath = path.join(tempDir, `orig_${id}.txt`);
    const proofPath = path.join(tempDir, `proof_${id}.txt`);
    
    fs.writeFileSync(origPath, originalImage);
    fs.writeFileSync(proofPath, proofImage);

    // Python script uses sys.argv, but we will modify python to read from file if it doesn't start with http/data:image.
    // Wait, my python script uses load_image which reads files!
    // But if we pass a text file containing base64, PIL will fail.
    // Let's decode the base64 in JS and write as a .jpg file!

    function writeImageToFile(b64, filepath) {
      if (b64.startsWith('http')) {
        fs.writeFileSync(filepath + '.txt', b64);
        return filepath + '.txt';
      }
      
      // Handle local seed paths
      if (b64.startsWith('/')) {
        const localPath = path.join(process.cwd(), 'public', b64);
        if (fs.existsSync(localPath)) {
          return localPath;
        }
      }
      
      const parts = b64.split(',');
      const base64Data = parts.length > 1 ? parts[1] : parts[0];
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filepath, buffer);
      return filepath;
    }

    const origImgPath = writeImageToFile(originalImage, path.join(tempDir, `orig_${id}.jpg`));
    const proofImgPath = writeImageToFile(proofImage, path.join(tempDir, `proof_${id}.jpg`));

    const pythonProcess = spawn('python', [pythonScriptPath, origImgPath, proofImgPath, title, description], {
      cwd: pythonScriptDir
    });

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
      console.log(`[VISION CORE] ${data.toString().trim()}`);
    });

    pythonProcess.on('close', (code) => {
      // Cleanup temp files
      try {
        if (fs.existsSync(origImgPath)) fs.unlinkSync(origImgPath);
        if (fs.existsSync(proofImgPath)) fs.unlinkSync(proofImgPath);
      } catch(e) {}

      if (code !== 0) {
        reject(new Error(`Vision AI exited with code ${code}: ${stderrData}`));
      } else {
        try {
          // Find the JSON block in stdout (ignoring debug prints)
          const jsonStr = stdoutData.substring(stdoutData.indexOf('{'), stdoutData.lastIndexOf('}') + 1);
          resolve(JSON.parse(jsonStr));
        } catch (e) {
          reject(new Error(`Failed to parse vision output: ${stdoutData}`));
        }
      }
    });
  });
}

export async function POST(req) {
  try {
    const { originalImage, proofImage, title, description } = await req.json();

    if (!originalImage || !proofImage) {
      return NextResponse.json({ error: 'Both originalImage and proofImage are required' }, { status: 400 });
    }

    // Call ML Model
    const result = await runVisionML(originalImage, proofImage, title || '', description || '');

    return NextResponse.json(result);

  } catch (error) {
    console.error('Vision API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
