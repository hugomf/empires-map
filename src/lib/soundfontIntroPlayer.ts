/**
 * Intro musical con SoundFont: reproduce `assets/intro.mid` usando soundfont-player
 * en lugar de síntesis de osciladores básicos.
 *
 * Usa `leerMidi` (de ./midi) para parsear el archivo y asigna notas a instrumentos
 * reales mediante un SoundFont GM (Fluid R3 o similar).
 *
 * Los navegadores no permiten audio sin un gesto del usuario. Por eso
 * `iniciar()` se puede llamar al mostrar la página: si el navegador todavía no
 * autoriza el audio devuelve `false` en silencio, y la app lo reintenta en la
 * primera interacción (clic, toque o tecla).
 */

import { readMidi, type PiezaMidi } from './midi';
import type { Player } from 'soundfont-player';

interface VozSoundFont {
  /** Velocidad MIDI (0-127). */
  velocidad: number;
}

type VentanaAudio = Window & { webkitAudioContext?: typeof AudioContext };

export class SoundfontIntroPlayer {
  private ctx: AudioContext | null = null;
  private activo = false;
  private _volumen = 0.3;
  /** Voces SoundFont activas en reproducción. */
  private voces: VozSoundFont[] = [];
  /** Evita dos arranques simultáneos (autoplay + primer gesto). */
  private arranque: Promise<boolean> | null = null;
  /** Invalida arranques en curso cuando se detiene o se reinicia. */
  private generacion = 0;
  /** MIDI descargado una sola vez y reutilizado en cada reproducción. */
  private datos: ArrayBuffer | null = null;
  private descarga: Promise<ArrayBuffer> | null = null;
  /** Instrumento SoundFont cargado (para preservar el contexto). */
  private instrumento: Player | null = null;
  private finTimer: number | null = null;
  private oyentes = new Set<() => void>();
  /** Nodo master para control de volumen (añadido al contexto). */
  private master: GainNode | null = null;

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
    const master = this.master;
    if (master) {
      const ahora = this.ctx!.currentTime;
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
   * Carga y reproduce intro.mid usando SoundFont.
   * Devuelve `true` si ha empezado a sonar, o `false` si el navegador todavía no
   * permite audio.
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

    /* Crear nodo master para control de volumen */
    const master = ctx.createGain();
    const guardado = parseFloat(localStorage.getItem('cronica-audio') ?? '');
    this._volumen =
      Number.isFinite(guardado) && guardado >= 0 && guardado <= 1 ? guardado : 0.3;
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(this._volumen, ctx.currentTime + 1.5);
    master.connect(ctx.destination);
    this.master = master;

    this.ctx = ctx;

    let pieza: PiezaMidi;
      try {
        const datos = await this.datosMidi();
        if (generacion !== this.generacion) {
          await ctx.close();
          return false;
        }
        pieza = readMidi(datos);
      } catch (error) {
        console.error('Soundfont intro MIDI:', error);
        await ctx.close();
        return false;
      }

    /* Cargar instrumento SoundFont (piano acústico como predeterminado) */
    let instrumento: Player;
    try {
      const Soundfont = await import('soundfont-player');
      instrumento = await Soundfont.instrument(ctx, 'acoustic_grand_piano');
      this.instrumento = instrumento;
    } catch (error) {
      console.error('Soundfont load error:', error);
      await ctx.close();
      return false;
    }

    /* Programar notas usando el instrumento SoundFont */
    this.voces = [];
    this.programar(pieza, ctx.currentTime, instrumento);

    this.activo = true;
    this.avisar();
    return true;
  }

  /** Descarga (o reutiliza) el MIDI de la intro. */
  private datosMidi(): Promise<ArrayBuffer> {
    if (this.datos) return Promise.resolve(this.datos);
    if (!this.descarga) {
      this.descarga = fetch('../../assets/intro.mid')
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

  /** Corta la intro con un fundido y libera los instrumentos SoundFont. */
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

    /* Liberar el instrumento SoundFont */
    try {
      this.instrumento?.stop();
    } catch {
      /* ya estaba detenido */
    }
    this.voces = [];
    this.instrumento = null;

    this.master = null;

    this.ctx = null;
    this.activo = false;
    this.avisar();

    /* El contexto se cierra después del fundido; el estado ya está limpio
       para que un nuevo clic pueda arrancar otra reproducción. */
    window.setTimeout(() => void ctx.close(), 900);
  }

  /** Programa todas las notas de la pieza usando instrumentos SoundFont. */
  private programar(pieza: PiezaMidi, t0: number, instrumento: Player): void {
    /* Apagar al terminar la pieza (con margen para la cola de las notas). */
    this.finTimer = window.setTimeout(
      () => this.detener(),
      Math.max(0, pieza.duracion + 1.2) * 1000,
    );

    for (const pista of pieza.tracks) {
      for (const nota of pista.notas) {
        const t = t0 + nota.t;
        const dur = nota.dur;
        const velocidad = nota.vel;
        
        /* Convertir nota MIDI a nota científica (ej. 60 -> 'C4') */
        const notaCientifica = this.notaMidiANotaCientifica(nota.nota);
        
        /* Activar nota con el instrumento SoundFont */
        this.voces.push({ velocidad });
        instrumento.play(notaCientifica, t, { duration: dur });
      }
    }
  }

  /** Convierte nota MIDI (0-127) a nombre científico (ej. 60 -> 'C4'). */
  private notaMidiANotaCientifica(nota: number): string {
    const octava = Math.floor(nota / 12) - 1;
    const semitono = nota % 12;
    const nombres = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return `${nombres[semitono]}${octava}`;
  }
}

export const soundfontIntro = new SoundfontIntroPlayer();
