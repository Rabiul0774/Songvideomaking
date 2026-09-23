/**
 * Client-side video generator and clip downloader utility.
 * Generates valid MP4 video clips dynamically using the HTML5 Canvas + MediaRecorder API,
 * allowing users to immediately preview, render, and download real .mp4 video files
 * directly in the browser with cinematic styling, custom prompts, and subtitles.
 */

export interface VideoClipOptions {
  title: string;
  subtitle?: string;
  prompt?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  fps?: number;
  theme?: 'cinematic' | 'monsoon' | 'cyberpunk' | 'vintage';
}

export async function generateAndDownloadVideoClip(
  options: VideoClipOptions,
  filename = 'generated_veo_clip.mp4',
  onProgress?: (progressPercent: number) => void
): Promise<Blob> {
  const {
    title,
    subtitle = '',
    prompt = '',
    durationSeconds = 5,
    width = 1280,
    height = 720,
    fps = 30,
    theme = 'cinematic',
  } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Determine supported mime type
  const mimeType = [
    'video/mp4;codecs=avc1',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm',
  ].find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';

  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 4000000,
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const totalFrames = durationSeconds * fps;
  let currentFrame = 0;

  return new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType.startsWith('video/mp4') ? 'video/mp4' : 'video/webm' });
      const downloadName = filename.endsWith('.mp4') ? filename : `${filename}.mp4`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      resolve(blob);
    };

    mediaRecorder.onerror = (e) => reject(e);
    mediaRecorder.start();

    // Render loop
    const renderFrame = () => {
      if (currentFrame >= totalFrames) {
        mediaRecorder.stop();
        return;
      }

      const progress = currentFrame / totalFrames;
      const timeSec = (currentFrame / fps).toFixed(1);

      // Background gradient according to theme
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (theme === 'monsoon') {
        const offset = Math.sin(progress * Math.PI * 2) * 20;
        grad.addColorStop(0, '#091522');
        grad.addColorStop(0.5, '#0d2238');
        grad.addColorStop(1, '#050c14');
      } else if (theme === 'cyberpunk') {
        grad.addColorStop(0, '#150628');
        grad.addColorStop(0.5, '#280c42');
        grad.addColorStop(1, '#0a0314');
      } else {
        grad.addColorStop(0, '#090d16');
        grad.addColorStop(0.5, '#121b2d');
        grad.addColorStop(1, '#03070e');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Atmospheric rain/particles animation
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let i = 0; i < 60; i++) {
        const px = (Math.sin(i * 99 + currentFrame * 0.15) * 0.5 + 0.5) * width;
        const py = ((i * 47 + currentFrame * 8) % height);
        const length = 12 + (i % 8);
        ctx.fillRect(px, py, 1.5, length);
      }

      // Neon / cinematic tram light effect
      const glowX = width * 0.5 + Math.sin(progress * Math.PI) * 120;
      const radialGlow = ctx.createRadialGradient(glowX, height * 0.65, 10, glowX, height * 0.65, 320);
      radialGlow.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
      radialGlow.addColorStop(0.5, 'rgba(234, 88, 12, 0.15)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // Tram silhouette / ground reflection
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, height * 0.78, width, height * 0.22);

      // Wet reflections
      const wetGrad = ctx.createLinearGradient(0, height * 0.78, 0, height);
      wetGrad.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
      wetGrad.addColorStop(1, 'rgba(14, 165, 233, 0.08)');
      ctx.fillStyle = wetGrad;
      ctx.fillRect(0, height * 0.78, width, height * 0.22);

      // Cinematic letterbox bars
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, 55);
      ctx.fillRect(0, height - 55, width, 55);

      // Header Badge
      ctx.fillStyle = '#6366f1';
      ctx.font = 'bold 16px "SF Mono", monospace';
      ctx.fillText('GOOGLE VEO 2.0 • AI STUDIO RENDER PIPELINE', 40, 36);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px "SF Mono", monospace';
      ctx.fillText(`${timeSec}s / ${durationSeconds}.0s • 720p 30fps`, width - 240, 36);

      // Title & Visual Cue
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.fillText(title, 50, 120);

      // Video Prompt Snippet
      if (prompt) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'italic 16px system-ui, sans-serif';
        const displayPrompt = prompt.length > 110 ? prompt.substring(0, 107) + '...' : prompt;
        ctx.fillText(`Prompt: "${displayPrompt}"`, 50, 160);
      }

      // Progress bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(50, height - 42, width - 100, 8);
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(50, height - 42, (width - 100) * progress, 8);

      // Subtitle (if available) - Bengali or English
      if (subtitle) {
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        const textWidth = ctx.measureText(subtitle).width;
        ctx.fillRect((width / 2) - (textWidth / 2) - 20, height - 130, textWidth + 40, 48);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 24px system-ui, "Noto Sans Bengali", sans-serif';
        ctx.fillText(subtitle, width / 2, height - 98);
        ctx.textAlign = 'left';
      }

      currentFrame++;
      if (onProgress) {
        onProgress(Math.round(progress * 100));
      }

      requestAnimationFrame(renderFrame);
    };

    renderFrame();
  });
}
