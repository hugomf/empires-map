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

import { SoundfontIntroPlayer } from './soundfontIntroPlayer';

// Re-exportar la clase y la instancia para mantener compatibilidad con el código existente.
export { SoundfontIntroPlayer };
export const intro = new SoundfontIntroPlayer();

// Alias para mantenibilidad: permitir que los importadores usen `intro` sin cambios.
export default intro;
