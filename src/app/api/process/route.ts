// api/process/route.ts
import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { Orchestrator, UploadedFile } from '../../../../../ai-agent-analysis/orchestrator/Orchestrator';

let orchestrator: Orchestrator | null = null;
async function getOrchestrator() {
  if (!orchestrator) {
    orchestrator = new Orchestrator();
    await orchestrator.initialize();
  }
  return orchestrator;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const input = (formData.get('input') as string) || '';
  const fileCount = Number(formData.get('fileCount') || 0);

  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const uploadedFiles: UploadedFile[] = [];
  for (let i = 0; i < fileCount; i++) {
    const file = formData.get(`file-${i}`) as File;
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const path = join(uploadsDir, filename);
    await writeFile(path, buffer);
    uploadedFiles.push({ name: file.name, path, type: file.type });
  }

  const orchestrator = await getOrchestrator();
  const encoder = new TextEncoder();

 const stream = new ReadableStream({
  async start(ctrl) {
    const stepListener = (step) => {
      ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'step-update', data: step })}\n\n`));
    };
    orchestrator.on('step-update', stepListener);

    try {
      const result = await orchestrator.processRequest(input, uploadedFiles);
      ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete', data: result })}\n\n`));
    } catch (error: any) {
      // Use stringifying the full error for debugging
      ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', data: error.stack || error.message || String(error) })}\n\n`));
    } finally {
      orchestrator.off('step-update', stepListener);
      ctrl.close();
    }
  },
  cancel() {
    orchestrator?.removeAllListeners('step-update');
  }
});


  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
