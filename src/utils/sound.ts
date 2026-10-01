// Sistema de Áudio Sintetizado Web Audio API para Rogue Term
// Efeitos táteis de Teclado Mecânico (Thock) e Fanfarras Retrô Chiptune

import { TileStatus } from '@/types/game';

class SoundService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  // Verifica se o som está ativado nas preferências
  private isEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      // Lê diretamente do localStorage persistido do zustand
      const storage = localStorage.getItem('rogue-term-storage');
      if (storage) {
        const parsed = JSON.parse(storage);
        if (parsed?.state?.soundEnabled !== undefined) {
          return Boolean(parsed.state.soundEnabled);
        }
      }
    } catch {
      // fallback habilitado
    }
    return true;
  }

  // 1. Som de Tecla Mecânica ("Thock" tátil de switch lubrificado com keycap PBT)
  playKeyThock(keyChar?: string) {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Variação micro-tonal realista baseada na tecla para simular keycaps de tamanhos diferentes
    const charCode = (keyChar || 'A').charCodeAt(0);
    const pitchOffset = ((charCode % 7) - 3) * 6; // +/- 18Hz
    const jitter = (Math.random() - 0.5) * 10;
    const baseFreq = Math.max(130, 190 + pitchOffset + jitter);

    // Componente 1: O "Thud" encorpado de fundo (Bottom-Out de switch mecânico)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.055);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(150, now + 0.055);

    oscGain.gain.setValueAtTime(0.22, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.065);

    // Componente 2: O clique sutil de contato mecânico plástico ("Click/Snap")
    const bufferSize = ctx.sampleRate * 0.012; // 12ms de ruído
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2200 + pitchOffset * 10, now);
    noiseFilter.Q.setValueAtTime(2.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.018);
  }

  // 2. Som de Backspace (Tecla mais pesada e estabilizador de 2u)
  playBackspaceClack() {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.07);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // 3. Som de Enter (Submissão mecânica pesada com estabilizador)
  playEnterThock() {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Duplo clique mecânico satisfatório
    [0, 0.015].forEach((delay, idx) => {
      const t = now + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 170 : 110, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);

      gain.gain.setValueAtTime(idx === 0 ? 0.28 : 0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.095);
    });
  }

  // 4. Som de Erro / Balanço (Buzz retrô de palavra inválida ou violação de regra)
  playErrorBuzz() {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Dois pulsos curtos de onda dente-de-serra
    [0, 0.09].forEach(delay => {
      const t = now + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(115, t);
      osc.frequency.linearRampToValueAtTime(90, t + 0.06);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.075);
    });
  }

  // 5. Revelação de Letra / Flip (Tons harmoniosos de avaliação)
  playLetterEvaluation(status: TileStatus | 'correct' | 'present' | 'absent', colIndex: number) {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (status === 'absent') {
      // Pop sutil cinza
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
      return;
    }

    if (status === 'present') {
      // Tom amarelo (chime médio de marimba)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const baseFreq = 440 + colIndex * 35;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
      return;
    }

    if (status === 'correct') {
      // Tom verde brilhante e cristalino (sino harmônico)
      const freqs = [659.25, 783.99, 880.0, 987.77, 1174.66]; // Escala pentatônica maior ascendente
      const freq = freqs[colIndex] || 880;

      const osc = ctx.createOscillator();
      const harmonic = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      harmonic.type = 'triangle';
      harmonic.frequency.setValueAtTime(freq * 2, now);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      harmonic.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      harmonic.start(now);
      osc.stop(now + 0.19);
      harmonic.stop(now + 0.19);
    }
  }

  // 6. Fanfarra de Vitória da Rodada (Arpeggio eletrônico retrô Balatro-style)
  playVictoryFanfare() {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Notas da vitória: C5 -> E5 -> G5 -> B5 -> C6 -> E6 (triunfo clássico de fliperama)
    const melody = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51];

    melody.forEach((freq, i) => {
      const noteTime = now + i * 0.085;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i === melody.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      const duration = i === melody.length - 1 ? 0.5 : 0.18;
      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + duration + 0.05);
    });
  }

  // 7. Alerta de Chefe (Sirene dramática de mainframe)
  playBossAlert() {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);
    osc.frequency.linearRampToValueAtTime(220, now + 0.5);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  // 8. Ativação de Habilidade / Hack (Sweep cibernético ascendente)
  playSkillActivate() {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.22);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 9. Moedas / Compra no Mercado (Dual-tone ding clássico de arcade)
  playCoinCollect() {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    [987.77, 1318.51].forEach((freq, i) => {
      const t = now + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  // 10. Game Over (Descida fúnebre 8-bit)
  playGameOver() {
    if (!this.isEnabled()) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [349.23, 311.13, 277.18, 220.0]; // F4 -> Eb4 -> Db4 -> A3

    notes.forEach((freq, i) => {
      const t = now + i * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.3);
    });
  }
}

export const sound = new SoundService();
