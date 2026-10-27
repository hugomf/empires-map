/**
 * Intro musical: reproduce `assets/intro.mid` con la Web Audio API.
 *
 * Usa `leerMidi` (de ./midi) para parsear el archivo y sintetiza cada nota
 * con un oscilador. Todo se sintetiza en el navegador; no necesita
 * librerías externas ni dispositivos MIDI físicos.
 *
 * Los navegadores no permiten audio sin un gesto del usuario. Por eso
 * `iniciar()` se puede llamar al mostrar la página: si el navegador aún no
 * autoriza el audio devuelve `false` en silencio, y la app lo reintenta en la
 * primera interacción (clic, toque o tecla).
 */

import { leerMidi, type PiezaMidi } from './midi';
import introUrl from '../../assets/intro.mid?url';

interface Voz {
  nota: number;
  oscilador: OscillatorNode;
  ganancia: GainNode;
}

type VentanaAudio = Window & { webkitAudioContext?: typeof AudioContext };

export class IntroPlayer {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private activo = false;
  private _volumen = 0.3;

  /** Voces activas en reproducción. */
  private voces: Voz[] = [];

  /** Evita dos arranques simultáneos (autoplay + primer gesto). */
  private arranque: Promise<boolean> | null = null;
  /** Invalida arranques en curso cuando se detiene o se reinicia. */
  private generacion = 0;

  /** MIDI descargado una sola vez y reutilizado en cada reproducción. */
  private datos: ArrayBuffer | null = null;
  private descarga: Promise<ArrayBuffer> | null = null;

  private finTimer: number | null = null;
  private oyentes = new Set<() => void>();

  constructor() {
    /* Recupera el volumen guardado para que el control lo muestre ya al cargar. */
    try {
      const guardado = parseFloat(localStorage.getItem('cronica-audio') ?? '');
      if (Number.isFinite(guardado) && guardado >= 0 && guardado <= 1) {
        this._volumen = guardado;
      }
    } catch {
      /* Sin almacenamiento disponible: se usa el volumen por defecto. */
    }
  }

  get sonando(): boolean {
    return this.activo;
  }

  get volumen(): number {
    return this._volumen;
  }

  set volumen(v: number) {
    this._volumen = Math.max(0, Math.min(1, v));
    const ctx = this.ctx;
    const master = this.master;
    if (ctx && master) {
      const ahora = ctx.currentTime;
      master.gain.cancelScheduledValues(ahora);
      master.gain.setValueAtTime(master.gain.value, ahora);
      master.gain.linearRampToValueAtTime(this._volumen, ahora + 0.3);
    }
  }

  /** Avisa cuando cambia `sonando`. Devuelve la función para desuscribirse. */
  alCambiar(oyente: () => void): () => void {
    this.oyentes.add(oyente);
    return () => this.oyentes.delete(oyente);
  }

  private avisar(): void {
    for (const oyente of [...this.oyentes]) oyente();
  }

  /**
   * Carga y reproduce intro.mid. Devuelve `true` si ha empezado a sonar, o
   * `false` si el navegador todavía no permite audio.
   */
  async iniciar(): Promise<boolean> {
    if (this.activo) return true;
    if (this.arranque) return this.arranque;
    const generacion = ++this.generacion;
    const arranque = this.arrancar(generacion);
    this.arranque = arranque;
    try {
      return await arranque;
    } finally {
      if (this.arranque === arranque) this.arranque = null;
    }
  }

  private async arrancar(generacion: number): Promise<boolean> {
    const Ctx = window.AudioContext ?? (window as VentanaAudio).webkitAudioContext;
    if (!Ctx) return false;

    const ctx = new Ctx();
    /* Si ya hubo un gesto, el navegador dejará reanudar el contexto. Si no,
       se descarta sin generar avisos en consola y se reintenta al interactuar. */
    const puedeSonar = navigator.userActivation?.hasBeenActive ?? true;
    if (ctx.state === 'suspended') {
      if (!puedeSonar) {
        await ctx.close();
        return false;
      }
      try {
        await ctx.resume();
      } catch {
        await ctx.close();
        return false;
      }
    }
    if (ctx.state !== 'running' || generacion !== this.generacion) {
      await ctx.close();
      return false;
    }

    const master = ctx.createGain();
    const guardado = parseFloat(localStorage.getItem('cronica-audio') ?? '');
    this._volumen =
      Number.isFinite(guardado) && guardado >= 0 && guardado <= 1 ? guardado : 0.3;
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(this._volumen, ctx.currentTime + 1.5);
    master.connect(ctx.destination);

    let pieza: PiezaMidi;
    try {
      const datos = await this.datosMidi();
      if (generacion !== this.generacion) {
        await ctx.close();
        return false;
      }
      pieza = leerMidi(datos);
    } catch (error) {
      console.error('Intro MIDI:', error);
      await ctx.close();
      return false;
    }

    this.ctx = ctx;
    this.master = master;
    this.voces = [];
    this.programar(pieza, ctx.currentTime);

    this.activo = true;
    this.avisar();
    return true;
  }

  /** Descarga (o reutiliza) el MIDI de la intro. */
  private datosMidi(): Promise<ArrayBuffer> {
    if (this.datos) return Promise.resolve(this.datos);
    if (!this.descarga) {
      this.descarga = fetch(introUrl)
        .then((res) => {
          if (!res.ok) throw new Error(`No se pudo cargar intro.mid (${res.status})`);
          return res.arrayBuffer();
        })
        .then((datos) => {
          this.datos = datos;
          this.descarga = null;
          return datos;
        })
        .catch((error) => {
          this.descarga = null;
          throw error;
        });
    }
    return this.descarga;
  }

  /** Corta la intro con un fundido y libera los osciladores. */
  detener(): void {
    this.generacion++;
    this.arranque = null;

    if (this.finTimer !== null) {
      window.clearTimeout(this.finTimer);
      this.finTimer = null;
    }

    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) {
      if (this.activo) {
        this.activo = false;
        this.avisar();
      }
      return;
    }

    const ahora = ctx.currentTime;
    master.gain.cancelScheduledValues(ahora);
    master.gain.setValueAtTime(master.gain.value, ahora);
    master.gain.linearRampToValueAtTime(0, ahora + 0.8);

    for (const voz of this.voces) {
      try {
        voz.ganancia.gain.cancelScheduledValues(ahora);
        voz.ganancia.gain.setValueAtTime(voz.ganancia.gain.value, ahora);
        voz.ganancia.gain.linearRampToValueAtTime(0, ahora + 0.3);
        voz.oscilador.stop(ahora + 0.35);
      } catch {
        /* ya estaba parada */
      }
    }
    this.voces = [];

    this.ctx = null;
    this.master = null;
    this.activo = false;
    this.avisar();

    /* El contexto se cierra después del fundido; el estado ya está limpio
       para que un nuevo clic pueda arrancar otra reproducción. */
    window.setTimeout(() => void ctx.close(), 900);
  }

  /* ─── Síntesis ─────────────────────────────────────────── */

  /** Frecuencia de un número de nota MIDI (69 = A4 = 440 Hz). */
  private notaAFrecuencia(nota: number): number {
    return 440 * Math.pow(2, (nota - 69) / 12);
  }

  /** Forma de onda aproximada según el programa General MIDI. */
  private formaDeOnda(programa: number): OscillatorType {
    if (programa >= 40 && programa <= 49) return 'sawtooth'; // cuerdas
    if (programa >= 56 && programa <= 63) return 'sawtooth'; // metales
    if (programa >= 64 && programa <= 71) return 'sine'; // teclados
    if (programa >= 72 && programa <= 79) return 'sine'; // flauta
    if (programa >= 80 && programa <= 87) return 'sine'; // líder
    if (programa >= 96 && programa <= 103) return 'sine'; // pads
    if (programa >= 112 && programa <= 119) return 'sine'; // efectos
    return 'triangle'; // piano, bajo, etc.
  }

  /** Programa todas las notas de la pieza en el AudioContext. */
  private programar(pieza: PiezaMidi, t0: number): void {
    const master = this.master!;

    /* Apagar al terminar la pieza (con margen para la cola de las notas). */
    this.finTimer = window.setTimeout(
      () => this.detener(),
      Math.max(0, pieza.duracion + 1.2) * 1000,
    );

    for (const pista of pieza.pistas) {
      const programa = pista.programa;
      for (const nota of pista.notas) {
        const t = t0 + nota.t;
        this.tocarNota(nota.nota, nota.vel, t, nota.dur, master, programa);
      }
    }
  }

  /** Toca una nota con ataque y release. */
  private tocarNota(
    nota: number,
    velocidad: number,
    t: number,
    dur: number,
    master: GainNode,
    programa: number,
  ): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = this.formaDeOnda(programa);
    osc.frequency.value = this.notaAFrecuencia(nota);

    const env = ctx.createGain();
    const volNota = (velocidad / 127) * 0.1;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(volNota, t + 0.03);
    env.gain.linearRampToValueAtTime(volNota * 0.6, t + Math.max(dur * 0.5, 0.1));
    env.gain.linearRampToValueAtTime(0, t + dur);

    osc.connect(env);
    env.connect(master);

    osc.start(t);
    osc.stop(t + dur + 0.1);
    this.voces.push({ nota, oscilador: osc, ganancia: env });
  }
}

export const intro = new IntroPlayer();
