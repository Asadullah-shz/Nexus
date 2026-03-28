
export type CallSoundType = 'join' | 'leave' | 'mute' | 'unmute' | 'share';

const createChime = (ctx: AudioContext, freq: number, startTime: number, duration: number, volume = 0.1) => {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, startTime);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2.01, startTime);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + duration);
  osc2.stop(startTime + duration);
};

export const playCallSound = (type: CallSoundType) => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    switch (type) {
      case 'join':

        createChime(ctx, 392.00, now, 0.6, 0.1);
        createChime(ctx, 523.25, now + 0.1, 0.6, 0.08);
        createChime(ctx, 659.25, now + 0.2, 0.8, 0.06);
        break;
      case 'leave':

        createChime(ctx, 659.25, now, 0.5, 0.08);
        createChime(ctx, 523.25, now + 0.15, 0.7, 0.06);
        break;
      case 'mute':

        createChime(ctx, 440, now, 0.15, 0.05);
        createChime(ctx, 330, now + 0.05, 0.2, 0.04);
        break;
      case 'unmute':

        createChime(ctx, 440, now, 0.15, 0.05);
        createChime(ctx, 554, now + 0.05, 0.2, 0.06);
        break;
      case 'share':

        createChime(ctx, 523.25, now, 0.4, 0.08);
        createChime(ctx, 783.99, now + 0.05, 0.5, 0.07);
        break;
    }
  } catch (e) {
    console.error('Audio play failed', e);
  }
};