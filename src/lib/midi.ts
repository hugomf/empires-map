/**
 * MIDI file reader (SMF tipo 0/1).
 *
 * Extracts only what the browser synthesizer needs: notes with their time in seconds,
 * the General MIDI program of each track, and its pan.
 * Times are resolved using the tempo map from the file itself, so ritardandos
 * written in the MIDI are respected.
 *
 * Uses no dependencies: it's a manual walk over the DataView.
 */

export interface NotaMidi {
  /** Second when note starts, counted from the beginning of the piece. */
  t: number;
  /** Duration in seconds. */
  dur: number;
  /** MIDI note (0-127). */
  nota: number;
  /** MIDI velocity (0-127). */
  vel: number;
  /** MIDI channel (0-15). The 9 is the percussion kit. */
  canal: number;
}

export interface PistaMidi {
  nombre: string;
  /** General MIDI program (0-127). */
  programa: number;
  /** Pan -1 (left) to 1 (right). */
  pan: number;
  /** Volume 0-1. */
  volumen: number;
  notas: NotaMidi[];
}

export interface PiezaMidi {
  tracks: PistaMidi[];
  /** Second when last note ends. */
  duracion: number;
}

interface Raw {
  tick: number;
  nota: number;
  vel: number;
  on: boolean;
  canal: number;
}

interface RawTrack {
  nombre: string;
  programa: number;
  pan: number;
  volumen: number;
  crudas: Raw[];
}

function text(v: DataView, pos: number, length: number): string {
  let s = '';
  for (let i = 0; i < length; i++) s += String.fromCharCode(v.getUint8(pos + i));
  return s;
}

/** Read variable-length integer (up to 4 bytes) and return where it ends. */
function variable(v: DataView, pos: number): { value: number; end: number } {
  let value = 0;
  let p = pos;
  for (;;) {
    const b = v.getUint8(p++);
    value = (value << 7) | (b & 0x7f);
    if ((b & 0x80) === 0) break;
  }
  return { value, end: p };
}

export function readMidi(buffer: ArrayBuffer): PiezaMidi {
  const v = new DataView(buffer);
  if (buffer.byteLength < 14 || text(v, 0, 4) !== 'MThd') {
    throw new Error('The file is not a standard MIDI file');
  }

  const numTracks = v.getUint16(10);
  const division = v.getUint16(12);
  if (division & 0x8000) throw new Error('MIDI with SMPTE division not supported');
  const ppq = division || 480;

  const tracks: RawTrack[] = [];
  const tempos: { tick: number; us: number }[] = [];
  let pos = 8 + v.getUint32(4);

  for (let i = 0; i < numTracks && pos + 8 <= buffer.byteLength; i++) {
    const type = text(v, pos, 4);
    const length = v.getUint32(pos + 4);
    const fin = pos + 8 + length;
    pos += 8;
    if (type !== 'MTrk') {
      pos = fin;
      continue;
    }

    const track: RawTrack = {
      nombre: '',
      programa: 0,
      pan: 0,
      volumen: 1,
      crudas: [],
    };
    const abiertas = new Map<string, { tick: number; vel: number }[]>();
    let tick = 0;
    let status = 0;
    let programFixed = false;

    while (pos < fin) {
      const delta = variable(v, pos);
      tick += delta.value;
      pos = delta.end;

      let byte = v.getUint8(pos);
      if (byte & 0x80) {
        status = byte;
        pos++;
      }
      // If no status byte is present it's 'running status': the previous one is reused.

      const statusLower = status & 0xf0;

      if (statusLower === 0xff) {
        const meta = v.getUint8(pos++);
        const len = variable(v, pos);
        pos = len.end;
        if (meta === 0x51 && len.value === 3) {
          const us =
            (v.getUint8(pos) << 16) | (v.getUint8(pos + 1) << 8) | v.getUint8(pos + 2);
          tempos.push({ tick, us });
        } else if (meta === 0x03) {
          track.nombre = text(v, pos, len.value).trim();
        } else if (meta === 0x2f) {
          pos = fin;
          break;
        }
        pos += len.value;
        continue;
      }

      if (statusLower === 0xf0 || statusLower === 0xf7) {
        const len = variable(v, pos);
        pos = len.end + len.value;
        continue;
      }


      const canal2 = statusLower & 0x0f;

      if (statusLower === 0x90 || statusLower === 0x80) {
        const nota = v.getUint8(pos);
        const vel = v.getUint8(pos + 1);
        pos += 2;
        const on = statusLower === 0x90 && vel > 0;
        const key = `${canal2}:${nota}`;
        if (on) {
          const pila = abiertas.get(key) ?? [];
          pila.push({ tick, vel });
          abiertas.set(key, pila);
        } else {
          const pila = abiertas.get(key);
          const previa = pila?.shift();
          if (previa) {
            track.crudas.push({
              tick: previa.tick,
              nota,
              vel: previa.vel,
              on: true,
              canal: canal2,
            });
            track.crudas.push({ tick, nota, vel: 0, on: false, canal: canal2 });
          }
        }
      } else if (statusLower === 0xc0) {
        if (!programFixed) {
          track.programa = v.getUint8(pos);
          programFixed = true;
        }
        pos += 1;
      } else if (statusLower === 0xd0) {
        pos += 1;
      } else if (statusLower === 0xb0) {
        const ctrl = v.getUint8(pos);
        const value = v.getUint8(pos + 1);
        pos += 2;
        if (ctrl === 10) track.pan = (value - 64) / 64;
        else if (ctrl === 7) track.volumen = value / 127;
      } else if (statusLower === 0xe0) {
        pos += 2;
      } else {
        pos += 2;
      }
    }

    tracks.push(track);
    pos = fin;
  }

  /* Tempo map: accumulated seconds at beginning of each segment. */
  tempos.sort((a, b) => a.tick - b.tick);
  const segments: { tick: number; s: number; us: number }[] = [];
  let s = 0;
  let tickPrevio = 0;
  let us = 500000;
  for (const t of tempos) {
    if (t.tick < tickPrevio) continue;
    s += ((t.tick - tickPrevio) / ppq) * (us / 1e6);
    segments.push({ tick: t.tick, s, us: t.us });
    tickPrevio = t.tick;
    us = t.us;
  }

  const seconds = (tick: number): number => {
    let base = 0;
    let desde = 0;
    let pulso = 500000;
    for (const segmento of segments) {
      if (segmento.tick > tick) break;
      base = segmento.s;
      desde = segmento.tick;
      pulso = segmento.us;
    }
    return base + ((tick - desde) / ppq) * (pulso / 1e6);
  };

  const output: PistaMidi[] = [];
  let duracion = 0;

  for (const track of tracks) {
    const notas: NotaMidi[] = [];
    const inicio = new Map<string, { tick: number; vel: number }>();

    for (const c of track.crudas) {
      const key = `${c.canal}:${c.nota}`;
      if (c.on) {
        inicio.set(key, { tick: c.tick, vel: c.vel });
      } else {
        const previa = inicio.get(key);
        if (!previa) continue;
        inicio.delete(key);
        const t = seconds(previa.tick);
        const dur = Math.max(0.04, seconds(c.tick) - t);
        notas.push({ t, dur, nota: c.nota, vel: previa.vel, canal: c.canal });
        duracion = Math.max(duracion, t + dur);
      }
    }

    notas.sort((a, b) => a.t - b.t);
    if (notas.length === 0) continue;
    output.push({
      nombre: track.nombre,
      programa: track.programa,
      pan: track.pan,
      volumen: track.volumen,
      notas,
    });
  }

  return { tracks: output, duracion };
}
