/**
 * Lector mínimo de archivos MIDI estándar (SMF tipo 0/1).
 *
 * Solo extrae lo que necesita el sintetizador del navegador: las notas con su
 * tiempo en segundos, el programa General MIDI de cada pista y su paneo.
 * Los tiempos se resuelven con el mapa de tempo del propio archivo, así que
 * los ritardandos escritos en el MIDI se respetan.
 *
 * No usa dependencias: es un recorrido a mano sobre el `DataView`.
 */

export interface NotaMidi {
  /** Segundo en que empieza, contado desde el inicio de la pieza. */
  t: number;
  /** Duración en segundos. */
  dur: number;
  /** Altura MIDI (0-127). */
  nota: number;
  /** Velocidad MIDI (0-127). */
  vel: number;
  /** Canal MIDI (0-15). El 9 es el kit de percusión. */
  canal: number;
}

export interface PistaMidi {
  nombre: string;
  /** Programa General MIDI (0-127). */
  programa: number;
  /** Paneo -1 (izquierda) a 1 (derecha). */
  pan: number;
  /** Volumen 0-1. */
  volumen: number;
  notas: NotaMidi[];
}

export interface PiezaMidi {
  pistas: PistaMidi[];
  /** Segundo en que termina la última nota. */
  duracion: number;
}

interface Crudo {
  tick: number;
  nota: number;
  vel: number;
  on: boolean;
  canal: number;
}

interface PistaCruda {
  nombre: string;
  programa: number;
  pan: number;
  volumen: number;
  crudas: Crudo[];
}

function texto(v: DataView, pos: number, largo: number): string {
  let s = '';
  for (let i = 0; i < largo; i++) s += String.fromCharCode(v.getUint8(pos + i));
  return s;
}

/** Lee un entero de longitud variable (hasta 4 bytes) y devuelve dónde acaba. */
function variable(v: DataView, pos: number): { valor: number; fin: number } {
  let valor = 0;
  let p = pos;
  for (;;) {
    const b = v.getUint8(p++);
    valor = (valor << 7) | (b & 0x7f);
    if ((b & 0x80) === 0) break;
  }
  return { valor, fin: p };
}

export function leerMidi(buffer: ArrayBuffer): PiezaMidi {
  const v = new DataView(buffer);
  if (buffer.byteLength < 14 || texto(v, 0, 4) !== 'MThd') {
    throw new Error('El archivo no es un MIDI estándar');
  }

  const nPistas = v.getUint16(10);
  const division = v.getUint16(12);
  if (division & 0x8000) throw new Error('MIDI con división SMPTE no soportado');
  const ppq = division || 480;

  const pistas: PistaCruda[] = [];
  const tempos: { tick: number; us: number }[] = [];
  let pos = 8 + v.getUint32(4);

  for (let i = 0; i < nPistas && pos + 8 <= buffer.byteLength; i++) {
    const tipo = texto(v, pos, 4);
    const largo = v.getUint32(pos + 4);
    const fin = pos + 8 + largo;
    pos += 8;
    if (tipo !== 'MTrk') {
      pos = fin;
      continue;
    }

    const pista: PistaCruda = {
      nombre: '',
      programa: 0,
      pan: 0,
      volumen: 1,
      crudas: [],
    };
    const abiertas = new Map<string, { tick: number; vel: number }[]>();
    let tick = 0;
    let estado = 0;
    let programaFijado = false;

    while (pos < fin) {
      const delta = variable(v, pos);
      tick += delta.valor;
      pos = delta.fin;

      let byte = v.getUint8(pos);
      if (byte & 0x80) {
        estado = byte;
        pos++;
      }
      // Si no hay byte de estado es «running status»: se reutiliza el anterior.

      if (estado === 0xff) {
        const meta = v.getUint8(pos++);
        const len = variable(v, pos);
        pos = len.fin;
        if (meta === 0x51 && len.valor === 3) {
          const us =
            (v.getUint8(pos) << 16) | (v.getUint8(pos + 1) << 8) | v.getUint8(pos + 2);
          tempos.push({ tick, us });
        } else if (meta === 0x03) {
          pista.nombre = texto(v, pos, len.valor).trim();
        } else if (meta === 0x2f) {
          pos = fin;
          break;
        }
        pos += len.valor;
        continue;
      }

      if (estado === 0xf0 || estado === 0xf7) {
        const len = variable(v, pos);
        pos = len.fin + len.valor;
        continue;
      }

      const alto = estado & 0xf0;
      const canal = estado & 0x0f;

      if (alto === 0x90 || alto === 0x80) {
        const nota = v.getUint8(pos);
        const vel = v.getUint8(pos + 1);
        pos += 2;
        const on = alto === 0x90 && vel > 0;
        const llave = `${canal}:${nota}`;
        if (on) {
          const pila = abiertas.get(llave) ?? [];
          pila.push({ tick, vel });
          abiertas.set(llave, pila);
        } else {
          const pila = abiertas.get(llave);
          const previa = pila?.shift();
          if (previa) {
            pista.crudas.push({
              tick: previa.tick,
              nota,
              vel: previa.vel,
              on: true,
              canal,
            });
            pista.crudas.push({ tick, nota, vel: 0, on: false, canal });
          }
        }
      } else if (alto === 0xc0) {
        if (!programaFijado) {
          pista.programa = v.getUint8(pos);
          programaFijado = true;
        }
        pos += 1;
      } else if (alto === 0xd0) {
        pos += 1;
      } else if (alto === 0xb0) {
        const ctrl = v.getUint8(pos);
        const valor = v.getUint8(pos + 1);
        pos += 2;
        if (ctrl === 10) pista.pan = (valor - 64) / 64;
        else if (ctrl === 7) pista.volumen = valor / 127;
      } else if (alto === 0xe0) {
        pos += 2;
      } else {
        pos += 2;
      }
    }

    pistas.push(pista);
    pos = fin;
  }

  /* Mapa de tempo: segundos acumulados al principio de cada tramo. */
  tempos.sort((a, b) => a.tick - b.tick);
  const tramos: { tick: number; s: number; us: number }[] = [];
  let s = 0;
  let tickPrevio = 0;
  let us = 500000;
  for (const t of tempos) {
    if (t.tick < tickPrevio) continue;
    s += ((t.tick - tickPrevio) / ppq) * (us / 1e6);
    tramos.push({ tick: t.tick, s, us: t.us });
    tickPrevio = t.tick;
    us = t.us;
  }

  const segundos = (tick: number): number => {
    let base = 0;
    let desde = 0;
    let pulso = 500000;
    for (const tramo of tramos) {
      if (tramo.tick > tick) break;
      base = tramo.s;
      desde = tramo.tick;
      pulso = tramo.us;
    }
    return base + ((tick - desde) / ppq) * (pulso / 1e6);
  };

  const salida: PistaMidi[] = [];
  let duracion = 0;

  for (const pista of pistas) {
    const notas: NotaMidi[] = [];
    const inicio = new Map<string, { tick: number; vel: number }>();

    for (const c of pista.crudas) {
      const llave = `${c.canal}:${c.nota}`;
      if (c.on) {
        inicio.set(llave, { tick: c.tick, vel: c.vel });
      } else {
        const previa = inicio.get(llave);
        if (!previa) continue;
        inicio.delete(llave);
        const t = segundos(previa.tick);
        const dur = Math.max(0.04, segundos(c.tick) - t);
        notas.push({ t, dur, nota: c.nota, vel: previa.vel, canal: c.canal });
        duracion = Math.max(duracion, t + dur);
      }
    }

    notas.sort((a, b) => a.t - b.t);
    if (notas.length === 0) continue;
    salida.push({
      nombre: pista.nombre,
      programa: pista.programa,
      pan: pista.pan,
      volumen: pista.volumen,
      notas,
    });
  }

  return { pistas: salida, duracion };
}
