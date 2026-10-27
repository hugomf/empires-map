/**
 * Introducción instrumental sintetizada en el navegador.
 *
 * Toma la pieza de `assets/fields-of-dawn.mid` (modo dórico sobre re, arpa,
 * flauta de pico, metales y timbales), la lee con `leerMidi` y la toca con
 * Web Audio: no se descarga ninguna grabación, solo el propio MIDI.
 *
 * Cada pista General MIDI se traduce a una voz:
 *
 *  · 46 arpa            → cuerda pulsada Karplus-Strong cacheada por nota
 *  · 47 timbal          → seno con caída de altura y golpe de ruido
 *  · 48/49 cuerdas      → dos sierras desafinadas con filtro
 *  · 42 cello           → sierra grave, filtro más cerrado
 *  · 52 coro            → tres triángulos desafinados, ataque lento
 *  · 60 trompa          → triángulo con sierra suave
 *  · 61 metal           → sierra con filtro que abre
 *  · 68 chirimía        → sierra con paso de banda nasal
 *  · 73/74 flauta       → triángulo con vibrato
 *  · canal 9            → percusión de mano sobre ruido filtrado
 *
 * Las notas se programan con una ventana de antelación para no crear los
 * nodos de los dos minutos de golpe.
 */

import { leerMidi, type NotaMidi } from './midi';

interface Evento extends NotaMidi {
  programa: number;
  pan: number;
  nivel: number;
}

export class IntroMidi {
  private ctx: AudioContext;
  private destino: AudioNode;
  private envio: AudioNode;

  private eventos: Evento[] = [];
  private indice = 0;
  private inicio = 0;
  private _duracion = 0;
  private timer: number | null = null;
  private finTimer: number | null = null;
  private fuentes: AudioScheduledSourceNode[] = [];
  private plucks = new Map<number, AudioBuffer>();
  private ruido: AudioBuffer | null = null;
  private alTerminar: (() => void) | null = null;
  private sonando = false;

  constructor(ctx: AudioContext, destino: AudioNode, envio: AudioNode) {
    this.ctx = ctx;
    this.destino = destino;
    this.envio = envio;
  }

  get duracion(): number {
    return this._duracion;
  }

  get activa(): boolean {
    return this.sonando;
  }

  cargar(datos: ArrayBuffer): void {
    const pieza = leerMidi(datos);
    const eventos: Evento[] = [];
    for (const pista of pieza.pistas) {
      for (const nota of pista.notas) {
        eventos.push({
          ...nota,
          programa: pista.programa,
          pan: pista.pan,
          nivel: pista.volumen,
        });
      }
    }
    eventos.sort((a, b) => a.t - b.t);
    this.eventos = eventos;
    this._duracion = pieza.duracion;
  }

  /** Arranca la reproducción; `alTerminar` se llama cuando suena la última nota. */
  tocar(alTerminar: () => void): void {
    if (this.eventos.length === 0) {
      alTerminar();
      return;
    }
    this.alTerminar = alTerminar;
    this.sonando = true;
    this.inicio = this.ctx.currentTime + 0.25;
    this.indice = 0;
    this.bomba();
    this.timer = window.setInterval(() => this.bomba(), 250);
    this.finTimer = window.setTimeout(
      () => this.terminar(),
      Math.max(0, (this.inicio - this.ctx.currentTime + this._duracion) * 1000),
    );
  }

  detener(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    if (this.finTimer !== null) window.clearTimeout(this.finTimer);
    this.timer = null;
    this.finTimer = null;
    this.sonando = false;
    for (const fuente of this.fuentes) {
      try {
        fuente.stop();
      } catch {
        /* ya estaba parada */
      }
    }
    this.fuentes = [];
  }

  private terminar(): void {
    if (!this.sonando) return;
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.sonando = false;
    this.alTerminar?.();
  }

  /** Programa las notas de los próximos 2,5 s. */
  private bomba(): void {
    if (!this.sonando) return;
    const hasta = this.ctx.currentTime - this.inicio + 2.5;
    while (this.indice < this.eventos.length && this.eventos[this.indice].t <= hasta) {
      const evento = this.eventos[this.indice++];
      this.voz(evento, this.inicio + evento.t);
    }
  }

  /* ───────────── voces ───────────── */

  private frec(nota: number): number {
    return 440 * Math.pow(2, (nota - 69) / 12);
  }

  private salida(pan: number): AudioNode {
    const nodo = this.ctx.createStereoPanner();
    nodo.pan.value = Math.max(-1, Math.min(1, pan));
    nodo.connect(this.destino);
    const send = this.ctx.createGain();
    send.gain.value = 0.45;
    nodo.connect(send);
    send.connect(this.envio);
    return nodo;
  }

  private fuente<T extends AudioScheduledSourceNode>(nodo: T): T {
    this.fuentes.push(nodo);
    return nodo;
  }

  /** Envolvente con ataque y caída exponenciales, sin clics. */
  private envolver(
    g: GainNode,
    t0: number,
    dur: number,
    nivel: number,
    ataque: number,
    caida: number,
  ): void {
    const pico = Math.max(0.0003, nivel);
    const subida = Math.min(Math.max(ataque, 0.004), Math.max(0.006, dur * 0.6));
    const fin = t0 + Math.max(dur, subida + 0.02);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(pico, t0 + subida);
    g.gain.setValueAtTime(pico, Math.max(t0 + subida, fin - 0.04));
    g.gain.exponentialRampToValueAtTime(0.0001, fin + caida);
  }

  private voz(e: Evento, t0: number): void {
    const salida = this.salida(e.pan);
    const v = (e.vel / 127) * Math.max(0.2, e.nivel);

    if (e.canal === 9) {
      this.percusion(e, t0, salida, v);
      return;
    }

    switch (e.programa) {
      case 46:
        this.arpa(e, t0, salida, v);
        break;
      case 47:
        this.timbal(e, t0, salida, v);
        break;
      case 42:
        this.cuerdas(e, t0, salida, v, true);
        break;
      case 48:
      case 49:
        this.cuerdas(e, t0, salida, v, false);
        break;
      case 52:
        this.coro(e, t0, salida, v);
        break;
      case 60:
        this.trompa(e, t0, salida, v);
        break;
      case 61:
        this.metal(e, t0, salida, v);
        break;
      case 68:
        this.chirimia(e, t0, salida, v);
        break;
      case 73:
      case 74:
        this.madera(e, t0, salida, v);
        break;
      default:
        this.madera(e, t0, salida, v * 0.8);
    }
  }

  /** Arpa: Karplus-Strong calculado una vez por altura y guardado en caché. */
  private arpa(e: Evento, t0: number, salida: AudioNode, v: number): void {
    const fuente = this.fuente(this.ctx.createBufferSource());
    fuente.buffer = this.pluck(e.nota);
    const g = this.ctx.createGain();
    g.gain.value = 0.16 * v;
    fuente.connect(g);
    g.connect(salida);
    fuente.start(t0);
    fuente.stop(t0 + Math.min(1.8, e.dur + 0.5));
  }

  private pluck(nota: number): AudioBuffer {
    const guardado = this.plucks.get(nota);
    if (guardado) return guardado;

    const sr = this.ctx.sampleRate;
    const largo = Math.floor(sr * 1.8);
    const buffer = this.ctx.createBuffer(1, largo, sr);
    const datos = buffer.getChannelData(0);
    const periodo = Math.max(2, Math.round(sr / this.frec(nota)));
    const anillo = new Float32Array(periodo);
    for (let i = 0; i < periodo; i++) anillo[i] = Math.random() * 2 - 1;

    let p = 0;
    let maximo = 0;
    for (let i = 0; i < largo; i++) {
      const actual = anillo[p];
      const siguiente = anillo[(p + 1) % periodo];
      anillo[p] = (actual + siguiente) * 0.5 * 0.9965;
      const muestra = actual * Math.pow(1 - i / largo, 0.65);
      datos[i] = muestra;
      if (Math.abs(muestra) > maximo) maximo = Math.abs(muestra);
      p = (p + 1) % periodo;
    }
    if (maximo > 0) {
      for (let i = 0; i < largo; i++) datos[i] /= maximo;
    }
    this.plucks.set(nota, buffer);
    return buffer;
  }

  /** Cuerdas: dos sierras desafinadas con filtro que respira. */
  private cuerdas(e: Evento, t0: number, salida: AudioNode, v: number, grave: boolean): void {
    const f = this.frec(e.nota);
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.Q.value = 0.5;
    filtro.frequency.setValueAtTime(grave ? 520 : 900, t0);
    filtro.frequency.linearRampToValueAtTime(grave ? 900 : 2000, t0 + 0.5);

    const g = this.ctx.createGain();
    this.envolver(g, t0, e.dur, (grave ? 0.06 : 0.05) * v, grave ? 0.5 : 0.32, 0.55);
    filtro.connect(g);
    g.connect(salida);

    for (const desvio of [-6, 5]) {
      const o = this.fuente(this.ctx.createOscillator());
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.detune.value = desvio;
      o.connect(filtro);
      o.start(t0);
      o.stop(t0 + e.dur + 0.65);
    }
  }

  /** Coro: tres triángulos desafinados con ataque largo. */
  private coro(e: Evento, t0: number, salida: AudioNode, v: number): void {
    const f = this.frec(e.nota);
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 1150;
    filtro.Q.value = 0.7;

    const g = this.ctx.createGain();
    this.envolver(g, t0, e.dur, 0.038 * v, 0.9, 1.1);
    filtro.connect(g);
    g.connect(salida);

    for (const desvio of [-9, 0, 8]) {
      const o = this.fuente(this.ctx.createOscillator());
      o.type = 'triangle';
      o.frequency.value = f;
      o.detune.value = desvio;
      o.connect(filtro);
      o.start(t0);
      o.stop(t0 + e.dur + 1.2);
    }
  }

  /** Flauta de pico y flauta travesera: triángulo con vibrato. */
  private madera(e: Evento, t0: number, salida: AudioNode, v: number): void {
    const f = this.frec(e.nota);
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = e.programa === 74 ? 2600 : 3400;

    const g = this.ctx.createGain();
    this.envolver(g, t0, e.dur, 0.075 * v, 0.05, 0.16);
    filtro.connect(g);
    g.connect(salida);

    const o = this.fuente(this.ctx.createOscillator());
    o.type = 'triangle';
    o.frequency.value = f;
    o.connect(filtro);
    o.start(t0);
    o.stop(t0 + e.dur + 0.2);

    const brillo = this.fuente(this.ctx.createOscillator());
    brillo.type = 'sine';
    brillo.frequency.value = f * 2;
    const gb = this.ctx.createGain();
    gb.gain.value = 0.18;
    brillo.connect(gb);
    gb.connect(filtro);
    brillo.start(t0);
    brillo.stop(t0 + e.dur + 0.2);

    const lfo = this.fuente(this.ctx.createOscillator());
    lfo.frequency.value = 5.1;
    const profundidad = this.ctx.createGain();
    profundidad.gain.setValueAtTime(0, t0);
    profundidad.gain.linearRampToValueAtTime(7, t0 + 0.35);
    lfo.connect(profundidad);
    profundidad.connect(o.detune);
    lfo.start(t0);
    lfo.stop(t0 + e.dur + 0.2);
  }

  /** Chirimía: doble lengüeta nasal. */
  private chirimia(e: Evento, t0: number, salida: AudioNode, v: number): void {
    const f = this.frec(e.nota);
    const banda = this.ctx.createBiquadFilter();
    banda.type = 'bandpass';
    banda.frequency.value = Math.min(2600, f * 2.4);
    banda.Q.value = 2.4;

    const g = this.ctx.createGain();
    this.envolver(g, t0, e.dur, 0.07 * v, 0.06, 0.2);
    banda.connect(g);
    g.connect(salida);

    const o = this.fuente(this.ctx.createOscillator());
    o.type = 'sawtooth';
    o.frequency.value = f;
    o.connect(banda);
    o.start(t0);
    o.stop(t0 + e.dur + 0.25);
  }

  /** Trompa: redonda, con ataque medio. */
  private trompa(e: Evento, t0: number, salida: AudioNode, v: number): void {
    const f = this.frec(e.nota);
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.setValueAtTime(600, t0);
    filtro.frequency.linearRampToValueAtTime(1200, t0 + 0.3);

    const g = this.ctx.createGain();
    this.envolver(g, t0, e.dur, 0.06 * v, 0.14, 0.35);
    filtro.connect(g);
    g.connect(salida);

    for (const tipo of ['triangle', 'sawtooth'] as const) {
      const o = this.fuente(this.ctx.createOscillator());
      o.type = tipo;
      o.frequency.value = f;
      o.detune.value = tipo === 'sawtooth' ? 4 : -3;
      const mezcla = this.ctx.createGain();
      mezcla.gain.value = tipo === 'sawtooth' ? 0.35 : 0.65;
      o.connect(mezcla);
      mezcla.connect(filtro);
      o.start(t0);
      o.stop(t0 + e.dur + 0.45);
    }
  }

  /** Metales: sierra con filtro que abre al atacar. */
  private metal(e: Evento, t0: number, salida: AudioNode, v: number): void {
    const f = this.frec(e.nota);
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.Q.value = 1.1;
    filtro.frequency.setValueAtTime(420, t0);
    filtro.frequency.linearRampToValueAtTime(3000, t0 + 0.12);
    filtro.frequency.linearRampToValueAtTime(1600, t0 + 0.6);

    const g = this.ctx.createGain();
    this.envolver(g, t0, e.dur, 0.055 * v, 0.045, 0.3);
    filtro.connect(g);
    g.connect(salida);

    for (const desvio of [-7, 6]) {
      const o = this.fuente(this.ctx.createOscillator());
      o.type = 'sawtooth';
      o.frequency.value = f;
      o.detune.value = desvio;
      o.connect(filtro);
      o.start(t0);
      o.stop(t0 + e.dur + 0.4);
    }
  }

  /** Timbal: seno que cae de altura sobre un golpe de ruido. */
  private timbal(e: Evento, t0: number, salida: AudioNode, v: number): void {
    const f = this.frec(e.nota);
    const o = this.fuente(this.ctx.createOscillator());
    o.type = 'sine';
    o.frequency.setValueAtTime(f * 1.55, t0);
    o.frequency.exponentialRampToValueAtTime(f, t0 + 0.09);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.42 * v, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.7);
    o.connect(g);
    g.connect(salida);
    o.start(t0);
    o.stop(t0 + 1.75);

    this.golpeRuido(t0, salida, 0.22 * v, 'lowpass', 320, 0.28);
  }

  /** Percusión General MIDI del canal 9. */
  private percusion(e: Evento, t0: number, salida: AudioNode, v: number): void {
    switch (e.nota) {
      case 41:
        this.parche(t0, salida, 84, 0.4 * v);
        break;
      case 43:
        this.parche(t0, salida, 110, 0.34 * v);
        break;
      case 45:
        this.parche(t0, salida, 150, 0.28 * v);
        break;
      case 47:
        this.parche(t0, salida, 205, 0.24 * v);
        break;
      case 54:
        this.golpeRuido(t0, salida, 0.1 * v, 'bandpass', 6500, 0.14, 1.4);
        break;
      case 82:
        this.golpeRuido(t0, salida, 0.055 * v, 'highpass', 5200, 0.07);
        break;
      case 49:
        this.golpeRuido(t0, salida, 0.09 * v, 'bandpass', 4200, 1.3, 0.7);
        break;
      case 37:
        this.golpeRuido(t0, salida, 0.08 * v, 'bandpass', 1800, 0.05, 3);
        break;
      default:
        this.golpeRuido(t0, salida, 0.07 * v, 'bandpass', 900, 0.12, 1.5);
    }
  }

  private parche(t0: number, salida: AudioNode, f: number, nivel: number): void {
    const o = this.fuente(this.ctx.createOscillator());
    o.type = 'sine';
    o.frequency.setValueAtTime(f * 1.8, t0);
    o.frequency.exponentialRampToValueAtTime(f, t0 + 0.06);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(nivel, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
    o.connect(g);
    g.connect(salida);
    o.start(t0);
    o.stop(t0 + 0.55);
    this.golpeRuido(t0, salida, nivel * 0.4, 'lowpass', 500, 0.12);
  }

  private golpeRuido(
    t0: number,
    salida: AudioNode,
    nivel: number,
    tipo: BiquadFilterType,
    frecuencia: number,
    caida: number,
    q = 1,
  ): void {
    const fuente = this.fuente(this.ctx.createBufferSource());
    fuente.buffer = this.ruidoBlanco();
    const filtro = this.ctx.createBiquadFilter();
    filtro.type = tipo;
    filtro.frequency.value = frecuencia;
    filtro.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, nivel), t0 + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + caida);
    fuente.connect(filtro);
    filtro.connect(g);
    g.connect(salida);
    fuente.start(t0);
    fuente.stop(t0 + caida + 0.05);
  }

  private ruidoBlanco(): AudioBuffer {
    if (this.ruido) return this.ruido;
    const sr = this.ctx.sampleRate;
    const largo = Math.floor(sr * 1.6);
    const buffer = this.ctx.createBuffer(1, largo, sr);
    const datos = buffer.getChannelData(0);
    for (let i = 0; i < largo; i++) datos[i] = Math.random() * 2 - 1;
    this.ruido = buffer;
    return buffer;
  }
}
