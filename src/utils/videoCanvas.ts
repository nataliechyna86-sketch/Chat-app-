import { VideoFilter, FaceOverlay } from '../types';

export function getFilterStyle(filter: VideoFilter): string {
  switch (filter) {
    case 'warm':
      return 'sepia(0.25) saturate(1.4) brightness(1.05) hue-rotate(-10deg)';
    case 'cyberpunk':
      return 'contrast(1.3) saturate(1.8) hue-rotate(170deg) brightness(1.1)';
    case 'noir':
      return 'grayscale(1) contrast(1.4) brightness(0.95)';
    case 'vintage':
      return 'sepia(0.6) contrast(1.1) brightness(0.9) saturate(0.8)';
    case 'glow':
      return 'brightness(1.15) contrast(1.1) drop-shadow(0 0 12px rgba(99, 102, 241, 0.4))';
    case 'blur':
      return 'blur(10px)';
    case 'none':
    default:
      return 'none';
  }
}

// Generate animated simulated partner video stream using HTML5 canvas
export function createSimulatedVideoStream(partnerName: string, partnerCountry: string): MediaStream {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d')!;

  let frame = 0;
  const particles: Array<{ x: number; y: number; speed: number; radius: number; color: string }> = [];
  const colors = ['#6366f1', '#ec4899', '#3b82f6', '#10b981'];

  for (let i = 0; i < 30; i++) {
    particles.push({
      x: Math.random() * 640,
      y: Math.random() * 480,
      speed: 0.5 + Math.random() * 1.5,
      radius: 1 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  let animationId: number;

  function render() {
    frame++;
    // Background gradient with subtle ambient motion
    const gradient = ctx.createLinearGradient(0, 0, 640, 480);
    const shift = Math.sin(frame * 0.02) * 20;
    gradient.addColorStop(0, `rgb(${20 + shift * 0.2}, ${24 + shift * 0.2}, 36)`);
    gradient.addColorStop(1, `rgb(${12}, ${14}, 24)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 640, 480);

    // Floating particles
    for (const p of particles) {
      p.y -= p.speed;
      if (p.y < 0) p.y = 480;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // Stylized Avatar
    const headX = 320;
    const headY = 210 + Math.sin(frame * 0.04) * 5;

    // Glow ring
    const ringGrad = ctx.createRadialGradient(headX, headY, 50, headX, headY, 110);
    ringGrad.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    ringGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(headX, headY, 110, 0, Math.PI * 2);
    ctx.fill();

    // Body shoulders
    ctx.fillStyle = '#27273a';
    ctx.beginPath();
    ctx.ellipse(headX, headY + 160, 140, 90, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head base
    ctx.fillStyle = '#ffd1aa';
    ctx.beginPath();
    ctx.arc(headX, headY, 65, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#2b1d0c';
    ctx.beginPath();
    ctx.arc(headX, headY - 15, 68, Math.PI * 0.85, Math.PI * 2.15);
    ctx.fill();

    // Eyes with blinking
    const isBlinking = frame % 120 > 112;
    ctx.fillStyle = '#1e1b4b';
    if (isBlinking) {
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(headX - 25, headY - 5);
      ctx.lineTo(headX - 10, headY - 5);
      ctx.moveTo(headX + 10, headY - 5);
      ctx.lineTo(headX + 25, headY - 5);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(headX - 18, headY - 5, 5, 0, Math.PI * 2);
      ctx.arc(headX + 18, headY - 5, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Smile / Talking mouth
    const isTalking = (frame % 80) < 45;
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (isTalking) {
      const mouthOpen = 4 + Math.sin(frame * 0.3) * 3;
      ctx.ellipse(headX, headY + 24, 12, mouthOpen, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#991b1b';
      ctx.fill();
    } else {
      ctx.arc(headX, headY + 20, 14, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }

    // Audio frequency bars simulation at bottom
    ctx.fillStyle = '#10b981';
    for (let i = 0; i < 16; i++) {
      const barH = 6 + Math.abs(Math.sin((frame + i * 15) * 0.15)) * 26;
      ctx.fillRect(240 + i * 10, 420 - barH, 6, barH);
    }

    // Partner badge HUD
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(20, 20, 220, 50, 10);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(38, 45, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`${partnerName}`, 52, 42);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.fillText(`📍 ${partnerCountry} · Live`, 52, 60);

    animationId = requestAnimationFrame(render);
  }

  render();

  const stream = canvas.captureStream(30);

  // Attach an audio track using Web Audio Oscillator so stream has real audio
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0.0001; // Silent carrier so track exists without annoying noise
      osc.connect(gain);
      const dest = audioCtx.createMediaStreamDestination();
      gain.connect(dest);
      osc.start();
      dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
    }
  } catch {}

  // Cleanup on stream track stop
  stream.getVideoTracks()[0].addEventListener('ended', () => {
    cancelAnimationFrame(animationId);
  });

  return stream;
}

// Draw snapshot of the video call and trigger download
export function captureCallSnapshot(
  localVideo: HTMLVideoElement | null,
  remoteVideo: HTMLVideoElement | null,
  partnerName: string
) {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1280, 720);

  // Draw remote video on left or main
  if (remoteVideo && remoteVideo.videoWidth > 0) {
    ctx.drawImage(remoteVideo, 0, 0, 640, 640);
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 640, 640);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px sans-serif';
    ctx.fillText(partnerName || 'Partner', 240, 320);
  }

  // Draw local video on right
  if (localVideo && localVideo.videoWidth > 0) {
    ctx.drawImage(localVideo, 640, 0, 640, 640);
  } else {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(640, 0, 640, 640);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px sans-serif';
    ctx.fillText('You', 920, 320);
  }

  // Footer banner
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 640, 1280, 80);

  ctx.fillStyle = '#6366f1';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('ChatPulse', 40, 690);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Random Video Chat Memory · ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 200, 690);

  // Trigger download
  const link = document.createElement('a');
  link.download = `chatpulse-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
