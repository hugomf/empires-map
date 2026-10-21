/**
 * Banda sonora original generada con Web Audio: nada de archivos externos.
 *
 * Capas:
 *  · bordón (drone) en modo dórico, dos osciladores desafinados
 *  · colchón armónico que cambia de acorde cada pocos compases
 *  · melodía de cuerda pulsada (Karplus-Strong) con frases del modo
 *  · pandero: golpes de ruido filtrado con reverberación de sala
 *
 * Sin copyright: todo se sintetiza en el navegador.
 */

type Escala = number[];

/* Modo dórico sobre Re: Re E F G A B C */
const ESCALA: Escala = [0, 2, 3, 5, 7, 9, 10];
const RAIZ = 146.83; // D3

const GRADOS = (n: number) => {
  const o = Math.floor(n / ESCALA.length);
  const g = ESCALA[n % ESCALA.length];
  return RAIZ * Math.pow(2, o + g / 12);
};

/* Acordes: Re menor, Si bemol, Fa, La */
const ACORDES: number[][] = [
  [0, 3, 7],
  [-4, 0, 5],
  [-7, -3, 0],
  [-5, -1, 2],
];

export class Musica {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private revero: ConvolverNode | null = null;
  private timer: number | null = null;
  private paso = 0;
  private volumen = 0.32;
  private activo = false;

  get sonando(): boolean {
    return this.activo;
  }

  /** Arranca la música (debe llamarse desde un gesto del usuario). */
  async iniciar(): Promise<void> {
    if (this.activo) return;
    const Ctx = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctx) return;
    this.ctx = new Ctx();
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    /* Reverberación: respuesta al impulso generada con ruido decaído */
    this.revero = ctx.createConvolver();
    const largo = Math.floor(ctx.sampleRate * 2.6);
    const impulse = ctx.createBuffer(2, largo, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = impulse.getChannelData(c);
      for (let i = 0; i < largo; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / largo, 2.6);
      }
    }
    this.revero.buffer = impulse;
    const retorno = ctx.createGain();
    retorno.gain.value = 0.38;
    this.revero.connect(retorno);
    retorno.connect(this.master);

    this.activarBordon();
    this.activarColchon();

    this.master.gain.setValueAtTime(0, ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(this.volumen, ctx.currentTime + 2.5);

    this.timer = window.setInterval(() => this.pulso(), 460);
    this.activo = true;
  }

  /** Corta la música con un fundido. */
  detener(): void {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setValueAtTime(this.master.gain.value, ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
    const t = window.setTimeout(() => {
      void this.ctx?.close();
      this.ctx = null;
      this.master = null;
    }, 1400);
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.activo = false;
    void t;
  }

  volumen_(v: number): void {
    this.volumen = v;
    if (this.master && this.activo) {
      this.master.gain.linearRampToValueAtTime(v, this.ctx!.currentTime + 0.4);
    }
  }

  /* ───────────── capas ───────────── */

  private activarBordon(): void {
    const ctx = this.ctx!;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 420;
    filtro.Q.value = 0.6;
    const g = ctx.createGain();
    g.gain.value = 0.16;
    filtro.connect(g);
    g.connect(this.master!);
    g.connect(this.revero!);

    for (const [f, det] of [
      [RAIZ / 2, -4],
      [RAIZ / 2, 5],
      [RAIZ, 3],
    ] as const) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.detune.value = det;
      o.connect(filtro);
      o.start();
    }

    /* respiración lenta del filtro */
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.055;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 190;
    lfo.connect(lfoG);
    lfoG.connect(filtro.frequency);
    lfo.start();
  }

  private activarColchon(): void {
    const ctx = this.ctx!;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.value = 0.05;
    filtro.connect(g);
    g.connect(this.master!);
    g.connect(this.revero!);

    const ahora = ctx.currentTime;
    ACORDES.forEach((acorde, i) => {
      const t0 = ahora + i * 9;
      for (const nota of acorde) {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = GRADOS(nota + 14);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, t0);
        env.gain.linearRampToValueAtTime(0.5, t0 + 3.4);
        env.gain.linearRampToValueAtTime(0, t0 + 9);
        o.connect(env);
        env.connect(filtro);
        o.start(t0);
        o.stop(t0 + 9.2);
      }
    });
  }

  /** Una cuerda pulsada: ruido corto en un lazo de retardo con realimentación. */
  private pulsada(frecuencia: number, volumen: number, t0: number): void {
    const ctx = this.ctx!;
    const retardo = ctx.createDelay(0.2);
    retardo.delayTime.value = 1 / frecuencia;
    const filtro = ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = Math.min(4200, frecuencia * 8);
    const realim = ctx.createGain();
    realim.gain.value = 0.955;
    const g = ctx.createGain();
    g.gain.value = volumen;

    retardo.connect(filtro);
    filtro.connect(realim);
    realim.connect(retardo);
    retardo.connect(g);
    g.connect(this.master!);
    g.connect(this.revero!);

    const ruido = ctx.createBufferSource();
    const n = Math.floor(ctx.sampleRate * 0.02);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    ruido.buffer = buf;
    ruido.connect(retardo);
    ruido.start(t0);

    const desv = ctx.createGain();
    desv.gain.value = 0.5;
    g.connect(desv);
    desv.connect(this.revero!);
  }

  /** Pandero: golpe de ruido filtrado con caída rápida. */
  private pandero(t0: number, fuerte: boolean): void {
    const ctx = this.ctx!;
    const n = Math.floor(ctx.sampleRate * 0.22);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.2);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const paso = ctx.createBiquadFilter();
    paso.type = 'bandpass';
    paso.frequency.value = fuerte ? 220 : 380;
    paso.Q.value = 1.1;
    const g = ctx.createGain();
    g.gain.value = fuerte ? 0.14 : 0.08;
    src.connect(paso);
    paso.connect(g);
    g.connect(this.master!);
    g.connect(this.revero!);
    src.start(t0);
  }

  /** Reloj: melodía y percusión, con silencios respirados. */
  private pulso(): void {
    if (!this.ctx || !this.activo) return;
    const ctx = this.ctx;
    const ahora = ctx.currentTime;
    this.paso++;

    /* pandero: pulso suave con acento cada cuatro */
    this.pandero(ahora, this.paso % 4 === 0);
    if (this.paso % 4 === 2) this.pandero(ahora + 0.24, false);

    /* melodía: frase de 3 a 6 notas, a veces con silencio */
    if (Math.random() < 0.62) {
      const largo = 3 + Math.floor(Math.random() * 4);
      let grado = 7 + Math.floor(Math.random() * 5);
      for (let i = 0; i < largo; i++) {
        const t0 = ahora + i * 0.46;
        const octava = Math.random() < 0.3 ? 2 : 1;
        this.pulsada(GRADOS(grado + octava * 7), 0.17, t0);
        grado += [-2, -1, 1, 2, -3][Math.floor(Math.random() * 5)];
        if (grado < 0) grado += 7;
        if (grado > 16) grado -= 7;
      }
    }
  }
}

export const musica = new Musica();
