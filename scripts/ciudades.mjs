/** Ciudades principales de cada civilización. */
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(import.meta.dirname, '..', 'datos');
const leer = (n) => JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'));
const escribir = (n, v) => fs.writeFileSync(path.join(dir, n), JSON.stringify(v, null, 2) + '\n');

const civilizaciones = leer('civilizaciones.json');
const ids = new Set(civilizaciones.map((c) => c.id));
const ciudades = fs.existsSync(path.join(dir, 'ciudades.json')) ? leer('ciudades.json') : [];
const existentes = new Set(ciudades.map((c) => `${c.civilizacion}|${c.nombre}`));
const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/* [civ, nombre, nombre moderno, lat, lon] */
const C = [
  ['sumer', 'Uruk', 'Uruk', 31.32, 45.64], ['sumer', 'Ur', 'Ur', 30.96, 46.1], ['sumer', 'Eridu', 'Eridu', 30.81, 47.78],
  ['sumer', 'Lagash', 'Al-Muthanna', 31.13, 46.8], ['sumer', 'Nippur', 'Nippur', 31.58, 45.43],
  ['ebla', 'Ebla', 'Tell Mardikh', 35.8, 36.78], ['ebla', 'Mari', 'Tell Hariri', 34.5, 40.89],
  ['akkad', 'Akkad', 'Tell Agir', 33.15, 44.13], ['akkad', 'Babilonia', 'Hillah', 32.54, 44.42],
  ['babilonia', 'Babilonia', 'Hillah, Irak', 32.54, 44.42], ['babilonia', 'Nínive', 'Mosul, Irak', 36.36, 43.15], ['babilonia', 'Uruk', 'Uruk', 31.32, 45.64],
  ['babilonia', 'Borsippa', 'Birs Nimrud', 32.54, 44.42],
  ['asiria', 'Nínive', 'Mosul, Irak', 36.36, 43.15], ['asiria', 'Asur', 'Qalat Sherqat', 35.46, 43.26], ['asiria', 'Babilonia', 'Hillah, Irak', 32.54, 44.42],
  ['asiria', 'Dur-Katlimmu', 'Tell Sheikh Hamad', 35.1, 40.6],
  ['hititas', 'Hattusa', 'Boğazköy, Turquía', 40.02, 34.62], ['hititas', 'Tardun', 'Tarsus, Turquía', 36.92, 34.9],
  ['minoicos', 'Cnoso', 'Heraklion, Creta', 35.3, 25.16], ['minoicos', 'Falasarna', 'Falasarna, Creta', 35.44, 24.19],
  ['micenicos', 'Micenas', 'Micenas, Grecia', 37.73, 22.76], ['micenicos', 'Pilos', 'Pilos, Grecia', 36.8, 21.68], ['micenicos', 'Tirinto', 'Tirinto, Grecia', 37.61, 22.85],
  ['egipto', 'Tebas', 'Luxor, Egipto', 25.72, 32.64], ['egipto', 'Menfis', 'Mit Rahina, Egipto', 29.87, 31.25], ['egipto', 'Gizeh', 'Giza, Egipto', 29.98, 31.13],
  ['egipto', 'Abidos', 'Abydos, Egipto', 26.18, 31.92], ['egipto', 'Elefantina', 'Elefantina, Egipto', 24.09, 32.9],
  ['ptolomeos', 'Alexandria', 'Alexandria, Egipto', 31.2, 29.92], ['ptolomeos', 'Canopo', 'Qanub, Egipto', 30.2, 31.13],
  ['fenicios', 'Tiro', 'Sur, Líbano', 33.27, 35.19], ['fenicios', 'Sidon', 'Sidón, Líbano', 33.56, 35.46], ['fenicios', 'Biblos', 'Byblos, Líbano', 34.12, 35.48],
  ['fenicios', 'Cartago', 'Túnez', 36.85, 10.32], ['fenicios', 'Utica', 'Utica, Túnez', 36.96, 10.31],
  ['filisteos', 'Gaza', 'Gaza', 31.52, 34.47], ['filisteos', 'Ascalón', 'Ascalón', 31.67, 34.67], ['filisteos', 'Gath', 'Tel Gath', 32.06, 34.92],
  ['filisteos', 'Ecrón', 'Tel Miqne', 31.83, 34.86],
  ['israel', 'Jerusalén', 'Jerusalén', 31.78, 35.22], ['israel', 'Hebrón', 'Hebrón', 31.53, 35.1], ['israel', 'Siquem', 'Nablús', 32.22, 35.26],
  ['israel', 'Samaría', 'Sebastiá', 32.28, 35.19], ['israel', 'Sión', 'Monte Sión, Jerusalén', 31.78, 35.23],
  ['aramas', 'Damasco', 'Damasco, Siria', 33.51, 36.29], ['aramas', 'Harrán', 'Harrán, Turquía', 36.86, 39.03], ['aramas', 'Alepo', 'Alepo, Siria', 36.2, 37.16],
  ['seleucidas', 'Antioquía', 'Antakya, Turquía', 36.2, 36.16], ['seleucidas', 'Seleucia del Tigris', 'Tell Umar, Irak', 33.47, 44.09], ['seleucidas', 'Éfeso', 'Selçuk, Turquía', 37.94, 27.34],
  ['nabateos', 'Petra', 'Petra, Jordania', 30.33, 35.44], ['nabateos', 'Aila', 'Aqaba, Jordania', 29.53, 35.01], ['nabateos', 'Avdat', 'Avdat, Israel', 30.84, 34.99],
  ['achaemenidas', 'Persépolis', 'Shiraz, Irán', 29.94, 52.89], ['achaemenidas', 'Susa', 'Shush, Irán', 32.19, 48.26], ['achaemenidas', 'Babilonia', 'Hillah, Irak', 32.54, 44.42],
  ['achaemenidas', 'Sardis', 'Sardis, Turquía', 38.48, 28.04], ['achaemenidas', 'Memfis', 'Mit Rahina, Egipto', 29.87, 31.25], ['achaemenidas', 'Taxila', 'Rawalpindi, Pakistán', 33.75, 72.8],
  ['partos', 'Ctesifón', 'Baghdad, Irak', 33.3, 44.58], ['partos', 'Hatra', 'Hatra, Irak', 35.58, 42.72],
  ['sasanidas', 'Ctesifón', 'Baghdad, Irak', 33.3, 44.58], ['sasanidas', 'Bishapur', 'Bishapur, Irán', 29.44, 51.57], ['sasanidas', 'Nishapur', 'Nishapur, Irán', 36.21, 58.79],
  ['cartago', 'Cartago', 'Túnez', 36.85, 10.32], ['cartago', 'Numancia', 'Gormaz, España', 41.8, -2.7], ['cartago', 'Panormo', 'Palermo, Italia', 38.12, 13.36],
  ['nubia', 'Napata', 'Nápata, Sudán', 19.72, 30.72], ['nubia', 'Meroe', 'Meroe, Sudán', 16.93, 33.74], ['nubia', 'Elefantina', 'Elefantina, Egipto', 24.09, 32.9],
  ['aksum', 'Axum', 'Aksum, Etiopía', 14.13, 38.72], ['aksum', 'Adulis', 'Zula, Eritrea', 15.26, 39.66], ['aksum', 'Mata', 'Maitá, Etiopía', 14.5, 38.5],
  ['etruscos', 'Vulci', 'Vulci, Italia', 42.42, 11.7], ['etruscos', 'Tarquinia', 'Tarquinia, Italia', 42.06, 11.8], ['etruscos', 'Cortona', 'Cortona, Italia', 43.28, 11.99],
  ['griegos', 'Atenas', 'Atenas, Grecia', 37.98, 23.73], ['griegos', 'Esparta', 'Esparta, Grecia', 37.07, 22.43], ['griegos', 'Corinto', 'Corinto, Grecia', 37.94, 22.93],
  ['griegos', 'Mileto', 'Mileto, Turquía', 37.53, 27.28], ['griegos', 'Olimpia', 'Olimpia, Grecia', 37.64, 21.63],
  ['macedonia', 'Pella', 'Pella, Grecia', 40.76, 22.52], ['macedonia', 'Filipos', 'Filipos, Grecia', 40.19, 23.73], ['macedonia', 'Tarsis', 'Tarsus, Turquía', 36.92, 34.9],
  ['roma', 'Roma', 'Roma, Italia', 41.9, 12.5], ['roma', 'Pompeya', 'Pompeya, Italia', 40.75, 14.49], ['roma', 'Ostia', 'Ostia, Italia', 41.75, 12.29],
  ['roma', 'Cartago', 'Túnez', 36.85, 10.32], ['roma', 'Alexandria', 'Alexandria, Egipto', 31.2, 29.92], ['roma', 'Lugduno', 'Lyon, Francia', 45.76, 4.83],
  ['roma', 'Tarraco', 'Tarragona, España', 41.12, 1.25], ['roma', 'Britannia', 'Londres, Reino Unido', 51.51, -0.13], ['roma', 'Éfeso', 'Selçuk, Turquía', 37.94, 27.34],
  ['bizantino', 'Constantinopla', 'Istanbul', 41.01, 28.98], ['bizantino', 'Antioquía', 'Antakya, Turquía', 36.2, 36.16], ['bizantino', 'Tesalónica', 'Salónica, Grecia', 40.64, 22.94],
  ['bizantino', 'Rávena', 'Rávena, Italia', 44.42, 12.2],
  ['francos', 'Aquisgrán', 'Aquisgrán, Alemania', 50.78, 6.08], ['francos', 'París', 'París, Francia', 48.86, 2.35], ['francos', 'Roma', 'Roma, Italia', 41.9, 12.5],
  ['iberia-cristiana', 'Toledo', 'Toledo, España', 39.86, -4.03], ['iberia-cristiana', 'Santiago', 'Santiago de Compostela, España', 42.88, -8.54], ['iberia-cristiana', 'Barcelona', 'Barcelona, España', 41.39, 2.17],
  ['iberia-cristiana', 'Córdoba', 'Córdoba, España', 37.89, -4.78], ['iberia-cristiana', 'Coimbra', 'Coimbra, Portugal', 40.21, -8.43],
  ['ottomanos', 'Constantinopla', 'Istanbul', 41.01, 28.98], ['ottomanos', 'Edirne', 'Edirne, Turquía', 41.68, 26.56], ['ottomanos', 'El Cairo', 'El Cairo, Egipto', 30.04, 31.24],
  ['ottomanos', 'Bursa', 'Bursa, Turquía', 40.19, 29.06], ['ottomanos', 'Belgrado', 'Belgrado, Serbia', 44.79, 20.45], ['ottomanos', 'Saray', 'Sarayebos, Bosnia', 43.86, 18.41],
  ['seljukas', 'Isfahan', 'Isfahán, Irán', 32.65, 51.67], ['seljukas', 'Nishapur', 'Nishapur, Irán', 36.21, 58.79], ['seljukas', 'Konya', 'Konya, Turquía', 37.87, 32.48],
  ['mongoles', 'Karakórum', 'Kharkhorin, Mongolia', 47.2, 102.85], ['mongoles', 'Tabriz', 'Tabriz, Irán', 38.08, 46.29], ['mongoles', 'Sarai', 'Selitrennoje, Rusia', 48.63, 44.99],
  ['mongoles', 'Bukhara', 'Bukhara, Uzbekistán', 39.77, 64.42], ['mongoles', 'Khanbaliq', 'Pekín, China', 39.91, 116.39], ['mongoles', 'Baghdad', 'Bagdad, Irak', 33.31, 44.36],
  ['timuridos', 'Samarcanda', 'Samarcanda, Uzbekistán', 39.65, 66.96], ['timuridos', 'Herat', 'Herat, Afganistán', 34.35, 62.2], ['timuridos', 'Isfahan', 'Isfahán, Irán', 32.65, 51.67],
  ['safavidas', 'Isfahan', 'Isfahán, Irán', 32.65, 51.67], ['safavidas', 'Qazvin', 'Qazvin, Irán', 36.28, 50.0], ['safavidas', 'Tabriz', 'Tabriz, Irán', 38.08, 46.29],
  ['qajar', 'Teherán', 'Teherán, Irán', 35.69, 51.39], ['qajar', 'Tabriz', 'Tabriz, Irán', 38.08, 46.29], ['qajar', 'Mashhad', 'Mashhad, Irán', 36.3, 59.6],
  ['iran-pahlavi', 'Teherán', 'Teherán, Irán', 35.69, 51.39], ['iran-pahlavi', 'Abadán', 'Abadán, Irán', 30.35, 48.67],
  ['iran-islamico', 'Teherán', 'Teherán, Irán', 35.69, 51.39], ['iran-islamico', 'Isfahan', 'Isfahán, Irán', 32.65, 51.67],
  ['indus', 'Mohenjo-Daro', 'Mohenjo-Daro, Pakistán', 27.33, 68.14], ['indus', 'Harappa', 'Harappa, Pakistán', 30.63, 72.86], ['indus', 'Dholavira', 'Khadir, India', 23.89, 70.22],
  ['veda', 'Valmiki', 'Valmiki, India', 25.51, 83.11], ['veda', 'Taxila', 'Rawalpindi, Pakistán', 33.75, 72.8],
  ['mauryas', 'Pataliputra', 'Patna, India', 25.61, 85.14], ['mauryas', 'Taxila', 'Rawalpindi, Pakistán', 33.75, 72.8], ['mauryas', 'Ujjain', 'Ujjain, India', 23.18, 75.78],
  ['guptas', 'Pataliputra', 'Patna, India', 25.61, 85.14], ['guptas', 'Ujjain', 'Ujjain, India', 23.18, 75.78], ['guptas', 'Nalanda', 'Bihar, India', 25.14, 85.44],
  ['chola', 'Thanjavur', 'Tamil Nadu, India', 10.79, 79.14], ['chola', 'Kanchipuram', 'Kanchipuram, India', 12.83, 79.7], ['chola', 'Anuradhapura', 'Anuradhapura, Sri Lanka', 8.31, 80.41],
  ['mogol', 'Agra', 'Agra, India', 27.18, 78.01], ['mogol', 'Delhi', 'Delhi, India', 28.61, 77.21], ['mogol', 'Lahore', 'Lahore, Pakistán', 31.55, 74.34],
  ['hola', 'Bombay', 'Bombay, India', 19.08, 72.88], ['hola', 'Delhi', 'Delhi, India', 28.61, 77.21], ['hola', 'Calcuta', 'Calcuta, India', 22.57, 88.36],
  ['china-antigua', 'Anyang', 'Anyang, China', 36.1, 114.3], ['china-antigua', 'Chengdu', 'Chengdu, China', 30.66, 104.06],
  ['qin', 'Xianyang', 'Xianyang, China', 34.34, 108.7], ['qin', 'Chengdu', 'Chengdu, China', 30.66, 104.06],
  ['han', 'Chang’an', 'Xi\'an, China', 34.34, 108.94], ['han', 'Luoyang', 'Luoyang, China', 34.62, 112.45],
  ['tang', 'Chang\'an', 'Xi\'an, China', 34.34, 108.94], ['tang', 'Luoyang', 'Luoyang, China', 34.62, 112.45],
  ['song', 'Kaifeng', 'Kaifeng, China', 34.8, 114.31], ['song', 'Lin\'an', 'Hangzhou, China', 30.25, 120.16],
  ['yuan', 'Dadú', 'Pekín, China', 39.91, 116.39], ['yuan', 'Shangdu', 'Zhenglan, Mongolia', 42.32, 116.1],
  ['ming', 'Pekín', 'Pekín, China', 39.91, 116.39], ['ming', 'Nankín', 'Nankín, China', 32.06, 118.8],
  ['qing', 'Pekín', 'Pekín, China', 39.91, 116.39], ['qing', 'Cantón', 'Guangzhou, China', 23.13, 113.26], ['qing', 'Kulang', 'Chengdu, China', 30.66, 104.06],
  ['china-republicana', 'Nankín', 'Nankín, China', 32.06, 118.8], ['china-republicana', 'Shanghái', 'Shanghái, China', 31.23, 121.47],
  ['china-popular', 'Pekín', 'Pekín, China', 39.91, 116.39], ['china-popular', 'Shanghái', 'Shanghái, China', 31.23, 121.47], ['china-popular', 'Cantón', 'Guangzhou, China', 23.13, 113.26],
  ['corea', 'Hanseong', 'Seúl, Corea', 37.57, 126.98], ['corea', 'Gyeongju', 'Gyeongju, Corea', 35.84, 129.22],
  ['coreas', 'Buyeo', 'Buyeo, Corea', 36.28, 126.55], ['coreas', 'Gyeongju', 'Gyeongju, Corea', 35.84, 129.22], ['coreas', 'P’yongyang', 'Pionyang, Corea', 39.02, 125.75],
  ['japon', 'Kioto', 'Kioto, Japón', 35.01, 135.77], ['japon', 'Edo', 'Tokio, Japón', 35.68, 139.69], ['japon', 'Nara', 'Nara, Japón', 34.69, 135.8],
  ['vietnam', 'Hà Nội', 'Hanói, Vietnam', 21.03, 105.85], ['vietnam', 'Huế', 'Huế, Vietnam', 16.05, 107.58], ['vietnam', 'Đại Việt', 'Hanoi, Vietnam', 21.03, 105.85],
  ['angkor', 'Angkor', 'Siem Reap, Camboya', 13.41, 103.87], ['angkor', 'Angkor Thom', 'Siem Reap, Camboya', 13.45, 103.86],
  ['kushanos', 'Peshawar', 'Peshawar, Pakistán', 34.01, 71.58], ['kushanos', 'Bactria', 'Balkh, Afganistán', 36.76, 66.9], ['kushanos', 'Mathura', 'Mathura, India', 27.49, 77.67],
  ['mali', 'Niani', 'Mali', 11.42, -8.91], ['mali', 'Timbuktu', 'Timbuktu, Malí', 16.77, -3.01], ['mali', 'Djenné', 'Djenné, Malí', 13.91, -4.55],
  ['songhai', 'Gao', 'Gao, Malí', 16.27, 0.04], ['songhai', 'Tombouctou', 'Timbuktu, Malí', 16.77, -3.01],
  ['kanem', 'Kanem', 'Lake Chad', 13.45, 14.4], ['kanem', 'Bornu', 'Maiduguri, Nigeria', 11.83, 13.15],
  ['ashanti', 'Kumasi', 'Kumasi, Ghana', 6.69, -1.62], ['ashanti', 'Gonja', 'Salaga, Ghana', 9.0, -0.83],
  ['buganda', 'Mengo', 'Kampala, Uganda', 0.35, 32.58], ['buganda', 'Nakaloke', 'Nakaloke, Uganda', 0.35, 32.53],
  ['zulu', 'Ulundi', 'Ulundi, Sudáfrica', -28.34, 31.42], ['zulu', 'KwaDukuza', 'KwaDukuza, Sudáfrica', -29.87, 31.02],
  ['merina', 'Antananarivo', 'Antananarivo, Madagascar', -18.88, 47.51], ['merina', 'Antsirabe', 'Antsirabe, Madagascar', -19.85, 47.03],
  ['etiopia', 'Gondar', 'Gondar, Etiopía', 12.6, 37.47], ['etiopia', 'Axum', 'Aksum, Etiopía', 14.13, 38.72], ['etiopia', 'Lalibela', 'Lalibela, Etiopía', 12.03, 39.04],
  ['olmecas', 'La Venta', 'Villamón, México', 18.11, -94.03], ['olmecas', 'San Lorenzo', 'Los Tuxtlas, México', 18.5, -95.2],
  ['zapotecos', 'Monte Albán', 'Oaxaca, México', 17.0, -96.73], ['zapotecos', 'Zaachila', 'Oaxaca, México', 16.99, -96.72],
  ['teotihuacan', 'Teotihuacán', 'Ciudad de México', 19.69, -98.84], ['teotihuacan', 'Tula', 'Tula, México', 20.06, -99.34],
  ['mayas', 'Tikal', 'Petén, Guatemala', 17.22, -89.62], ['mayas', 'Palenque', 'Chiapas, México', 17.51, -92.03], ['mayas', 'Copán', 'Copán, Honduras', 14.76, -89.05], ['mayas', 'Uxmal', 'Uxmal, México', 20.38, -89.64],
  ['toltecas', 'Tula', 'Tula, México', 20.06, -99.34], ['toltecas', 'Templo de Quetzalcóatl', 'Tula, México', 20.05, -99.35],
  ['mexica', 'Tenochtitlan', 'Ciudad de México', 19.43, -99.13], ['mexica', 'Texcoco', 'Texcoco, México', 19.51, -98.88], ['mexica', 'Templo Mayor', 'Ciudad de México', 19.44, -99.13],
  ['taino', 'Ayiti', 'Haití', 19.0, -72.42], ['taino', 'Bonao', 'La Romana, República Dominicana', 18.46, -70.72],
  ['muisca', 'Tundunavá', 'Pasca, Colombia', 4.89, -73.68], ['muisca', 'Sucre', 'Bogotá, Colombia', 4.6, -74.08],
  ['chavin', 'Chavín de Huántar', 'Chavín de Huántar, Perú', -9.42, -77.07], ['chavin', 'Kuntur Wasi', 'Ancash, Perú', -9.13, -77.2],
  ['tiwanaku', 'Tiwanaku', 'La Paz, Bolivia', -16.55, -68.67], ['tiwanaku', 'Pumapunku', 'La Paz, Bolivia', -16.51, -68.78],
  ['inca', 'Cuzco', 'Cuzco, Perú', -13.52, -71.97], ['inca', 'Quito', 'Quito, Ecuador', -0.18, -78.47], ['inca', 'Machu Picchu', 'Cusco, Perú', -13.16, -72.55],
  ['tairona', 'Ciudad Perdida', 'Santa Marta, Colombia', 10.78, -74.1], ['tairona', 'Nabusímake', 'Magangué, Colombia', 9.25, -74.78],
  ['mississipi', 'Cahokia', 'Collinsville, EE.UU.', 38.66, -90.06], ['mississipi', 'Etowah', 'Georgia, EE.UU.', 34.2, -84.6],
  ['comanche', 'Palo Duro', 'Canyon, Texas', 35.34, -101.65], ['comanche', 'Bend', 'Fort Sill, Oklahoma', 34.56, -98.1],
  ['anasazi', 'Chaco Canyon', 'Nuevo México, EE.UU.', 36.06, -107.97], ['anasazi', 'Mesa Verde', 'Colorado, EE.UU.', 37.23, -108.46],
  ['navajo', 'Window Rock', 'Arizona, EE.UU.', 35.68, -109.33], ['navajo', 'Shiprock', 'Nuevo México, EE.UU.', 36.79, -108.99],
  ['tarahumara', 'Guachochi', 'Chihuahua, México', 27.13, -107.4], ['tarahumara', 'Urique', 'Chihuahua, México', 27.4, -107.5],
  ['aborigenes', 'Kakadu', 'Territorio del Norte, Australia', -12.9, 132.5], ['aborigenes', 'Warlukurlangu', 'Yulara, Australia', -25.24, 131.08],
  ['kamilaroi', 'Brewarrina', 'Nueva Gales del Sur, Australia', -29.96, 146.85],
  ['tiwi', 'Wurrumiyanga', 'Isla Tiwi, Australia', -11.05, 130.55],
  ['san', 'Tsodilo', 'Botsuana', -18.75, 22.75], ['san', '//Khau', 'Namibia', -20.5, 15.0],
  ['khoi', 'Cabo', 'Ciudad del Cabo, Sudáfrica', -33.92, 18.42],
  ['berberes', 'Tingis', 'Tánger, Marruecos', 35.77, -5.81], ['berberes', 'Volubilis', 'Volubilis, Marruecos', 34.09, -5.37],
  ['tuareg', 'Agadez', 'Níger', 16.97, 7.99], ['tuareg', 'Timbuktu', 'Timbuktu, Malí', 16.77, -3.01],
  ['fulani', 'Kano', 'Kano, Nigeria', 12.0, 8.52], ['fulani', 'Sokoto', 'Sokoto, Nigeria', 13.06, 5.24],
  ['hausa', 'Kano', 'Kano, Nigeria', 12.0, 8.52], ['hausa', 'Zaria', 'Zaria, Nigeria', 11.08, 7.72],
  ['yoruba', 'Ife', 'Ife, Nigeria', 7.47, 4.57], ['yoruba', 'Oyo', 'Oyo, Nigeria', 7.9, 3.93],
  ['igbo', 'Nri', 'Anaocha, Nigeria', 6.1, 7.4], ['igbo', 'Onitsha', 'Onitsha, Nigeria', 6.14, 6.78],
  ['fon', 'Abomey', 'Abomey, Benín', 7.19, 1.99], ['fon', 'Ouidah', 'Ouidah, Benín', 6.36, 2.08],
  ['swahili', 'Kilwa', 'Kilwa, Tanzania', -8.96, 39.52], ['swahili', 'Mombasa', 'Mombasa, Kenia', -4.04, 39.67], ['swahili', 'Zanzíbar', 'Zanzíbar, Tanzania', -6.16, 39.2],
  ['shona', 'Gran Zimbabwe', 'Masvingo, Zimbabue', -20.27, 30.93], ['shona', 'Khami', 'Bulawayo, Zimbabue', -20.26, 28.81],
  ['luba', 'Kiluba', 'Lualaba, R.D. del Congo', -6.4, 23.5], ['luba', 'Kakongo', 'Kwilu, R.D. del Congo', -6.1, 23.4],
  ['maasai', 'Ngorongoro', 'Tanzania', -3.2, 35.6], ['maasai', 'Musiara', 'Kenia', -3.8, 35.3],
  ['vikingos', 'Kaupang', 'Vestfold, Noruega', 59.02, 10.03], ['vikingos', 'Ribe', 'Dinamarca', 55.33, 8.76],
  ['celtas', 'Hallstatt', 'Hallstatt, Austria', 47.56, 13.65], ['celtas', 'Danebury', 'Hampshire, Reino Unido', 51.14, -1.85],
  ['bulgaros', 'Pliska', 'Bulgaria', 43.0, 27.17], ['bulgaros', 'Preslav', 'Veliki Preslav, Bulgaria', 43.16, 27.0],
  ['hungaros', 'Székesfehérvár', 'Székesfehérvár, Hungría', 47.2, 19.6],
  ['lituanos', 'Vilnius', 'Vilnius, Lituania', 54.69, 25.28], ['lituanos', 'Kaunas', 'Kaunas, Lituania', 54.9, 23.9],
  ['polacos', 'Kraków', 'Cracovia, Polonia', 50.06, 19.94], ['polacos', 'Gniezno', 'Gniezno, Polonia', 52.6, 17.6],
  ['tibet', 'Lhasa', 'Lhasa, Tíbet', 29.65, 91.14], ['tibet', 'Samye', 'Tíbet', 29.25, 90.9],
  ['majapahit', 'Trowulan', 'Trowulan, Indonesia', -7.61, 112.38], ['majapahit', 'Palembang', 'Palembang, Indonesia', -2.99, 104.76],
  ['maratha', 'Pune', 'Pune, India', 18.52, 73.86], ['maratha', 'Raigad', 'Maharashtra, India', 18.23, 73.43],
  ['sikh', 'Amritsar', 'Amritsar, India', 31.63, 74.87], ['sikh', 'Lahore', 'Lahore, Pakistán', 31.55, 74.34],
  ['himyaritas', 'Zafar', ' Yemen', 14.2, 44.2], ['himyaritas', 'Marib', 'Yemen', 15.46, 45.33],
  ['benin', 'Ciudad de Benín', 'Benín City, Nigeria', 6.34, 5.62],
  ['chimu', 'Chan Chan', 'Trujillo, Perú', -8.11, -79.03],
  ['wari', 'Huari', 'Ayacucho, Perú', -13.25, -75.15],
  ['xiongnu', 'Longcheng', ' Mongolia', 47.5, 104.0],
  ['liao', 'Yanjing', 'Pekín, China', 39.91, 116.39],
  ['jurchen', 'Shangjing', 'Acheng, China', 45.54, 126.53],
  ['germanos', 'Borrunsberg', 'Borrby, Suecia', 55.2, 13.4],
  ['visigodos', 'Toledo', 'Toledo, España', 39.86, -4.03],
  ['ostrogodos', 'Rávena', 'Rávena, Italia', 44.42, 12.2],
  ['vandalos', 'Cartago', 'Túnez', 36.85, 10.32],
  ['lombardos', 'Pavia', 'Pavía, Italia', 45.19, 9.16],
  ['anglosajones', 'Winchester', 'Winchester, Reino Unido', 51.06, -1.31],
  ['moche', 'Chan Chan', 'Trujillo, Perú', -8.11, -79.03],
  ['nazca', 'Cahuachi', 'Nasca, Perú', -14.83, -74.94],
  ['mapuche', 'Cauca', 'Temuco, Chile', -38.74, -72.59],
  ['guaranies', 'Asunción', 'Asunción, Paraguay', -25.26, -57.58],
  ['tupinamba', 'Teso Bety', 'Amazonas, Brasil', -3.0, -60.0],
  ['chachapoyas', 'Kuélap', 'Amazonas, Perú', -6.42, -77.93],
  ['diaguitas', 'Túcuman', 'San Miguel de Tucumán, Argentina', -26.82, -65.22],
  ['umeyas', 'Damasco', 'Damasco, Siria', 33.51, 36.29], ['umeyas', 'al-Andalus', 'Córdoba, España', 37.89, -4.78],
  ['abasies', 'Bagdad', 'Bagdad, Irak', 33.31, 44.36], ['abasies', 'Samarra', 'Samarra, Irak', 34.2, 43.87], ['abasies', 'Córdoba', 'Córdoba, España', 37.89, -4.78],
  ['fatimies', 'El Cairo', 'El Cairo, Egipto', 30.04, 31.24], ['fatimies', 'Mahdia', 'Mahdia, Túnez', 35.5, 11.06],
  ['mamelucos', 'El Cairo', 'El Cairo, Egipto', 30.04, 31.24], ['mamelucos', 'Alepo', 'Alepo, Siria', 36.2, 37.16],
  ['espana', 'Toledo', 'Toledo, España', 39.86, -4.03], ['espana', 'Sevilla', 'Sevilla, España', 37.39, -5.98], ['espana', 'Potosí', 'Potosí, Bolivia', -19.58, -65.75],
  ['espana', 'Manila', 'Manila, Filipinas', 14.6, 120.98], ['espana', 'Tenochtitlan', 'Ciudad de México', 19.43, -99.13],
  ['espana', 'Cuzco', 'Cuzco, Perú', -13.52, -71.97], ['espana', 'Bogotá', 'Bogotá, Colombia', 4.6, -74.08],
  ['portugal', 'Lisboa', 'Lisboa, Portugal', 38.72, -9.14], ['portugal', 'Goa', 'Goa, India', 15.5, 73.83], ['portugal', 'Salvador', 'Salvador, Brasil', -12.97, -38.5],
  ['britania', 'Londres', 'Londres, Reino Unido', 51.51, -0.13], ['britania', 'Bombay', 'Bombay, India', 19.08, 72.88], ['britania', 'Calcuta', 'Calcuta, India', 22.57, 88.36],
  ['britania', 'El Cairo', 'El Cairo, Egipto', 30.04, 31.24], ['britania', 'Sydney', 'Sídney, Australia', -33.87, 151.21],
  ['reino-unido', 'Londres', 'Londres, Reino Unido', 51.51, -0.13],
  ['rusia', 'Moscú', 'Moscú, Rusia', 55.76, 37.62], ['rusia', 'San Petersburgo', 'San Petersburgo, Rusia', 59.93, 30.34], ['rusia', 'Nizhni Novgorod', 'Rusia', 56.33, 44.0],
  ['rus-kiev', 'Kiev', 'Kiev, Ucrania', 50.45, 30.52], ['rus-kiev', 'Novgorod', 'Veliky Novgorod, Rusia', 58.52, 31.27],
  ['napoleon', 'París', 'París, Francia', 48.86, 2.35], ['napoleon', 'Austerlitz', 'Slavkov u Brna, Chequia', 49.13, 16.76],
  ['austria', 'Viena', 'Viena, Austria', 48.21, 16.37], ['austria', 'Praga', 'Praga, Chequia', 50.08, 14.44],
  ['austrohungria', 'Viena', 'Viena, Austria', 48.21, 16.37], ['austrohungria', 'Budapest', 'Budapest, Hungría', 47.5, 19.04],
  ['mari', 'Mari', 'Tell Hariri, Siria', 34.55, 40.89], ['mari', 'Terqa', 'Tell Ashara, Siria', 34.92, 40.57],
  ['holanda', 'Ámsterdam', 'Ámsterdam, Países Bajos', 52.37, 4.9], ['holanda', 'Batavia', 'Yakarta, Indonesia', -6.21, 106.85],
  ['alemania', 'Berlín', 'Berlín, Alemania', 52.52, 13.4], ['alemania', 'Versalles', 'Versalles, Francia', 48.8, 2.13],
  ['tercerreich', 'Berlín', 'Berlín, Alemania', 52.52, 13.4], ['tercerreich', 'Auschwitz', 'Oświęcim, Polonia', 50.03, 19.18],
  ['sovietica', 'Moscú', 'Moscú, Rusia', 55.76, 37.62], ['sovietica', 'Leningrado', 'San Petersburgo, Rusia', 59.93, 30.34],
  ['estados-unidos', 'Nueva York', 'Nueva York, EE.UU.', 40.71, -74.01], ['estados-unidos', 'Washington', 'Washington, EE.UU.', 38.91, -77.04], ['estados-unidos', 'San Francisco', 'San Francisco, EE.UU.', 37.77, -122.42],
  ['imperio-brasileno', 'Río de Janeiro', 'Río de Janeiro, Brasil', -22.91, -43.17], ['imperio-brasileno', 'Salvador', 'Salvador, Brasil', -12.97, -38.5],
  ['segundo-imperio-mexicano', 'Ciudad de México', 'Ciudad de México', 19.43, -99.13], ['segundo-imperio-mexicano', 'Querétaro', 'Querétaro, México', 20.59, -100.39],
  ['mali-moderno', 'Bamako', 'Bamako, Malí', 12.64, -8.0], ['mali-moderno', 'Timbuktu', 'Timbuktu, Malí', 16.77, -3.01],
];

let n = 0;
const ignoradas = new Set();
for (const [civ, nombre, actual, lat, lon] of C) {
  if (!ids.has(civ)) {
    ignoradas.add(civ);
    continue;
  }
  if (existentes.has(`${civ}|${nombre}`)) continue;
  existentes.add(`${civ}|${nombre}`);
  ciudades.push({
    id: `${civ}-${slug(nombre)}`,
    civilizacion: civ,
    nombre,
    actual,
    lat,
    lon,
  });
  n++;
}

/* Cada civilización debe tener al menos una ciudad. Si alguna se queda sin
   entradas, el validador lo avisará para completarla a mano. */
const sinCiudad = civilizaciones.filter((c) => !ciudades.some((x) => x.civilizacion === c.id));
escribir('ciudades.json', ciudades);

/* La versión inglesa puede estar traducida sólo en parte. Las ciudades que
   falten se completan con la ficha española: los nombres propios suelen ser
   los mismos y, sobre todo, ninguna civilización se queda sin ciudades. */
const dirEn = path.join(dir, 'en');
if (fs.existsSync(dirEn)) {
  const rutaEn = path.join(dirEn, 'ciudades.json');
  const en = fs.existsSync(rutaEn) ? JSON.parse(fs.readFileSync(rutaEn, 'utf8')) : [];
  /* Las ciudades inglesas traducidas a mano usan ids `civ-cN`; las que se
     copian del español conservan el id descriptivo. Así se puede regenerar
     sin duplicar y sin perder las traducciones existentes. */
  const traducidas = en.filter((c) => /-c\d+$/.test(c.id));
  const civsEn = new Set(traducidas.map((c) => c.civilizacion));
  let completadas = 0;
  for (const c of ciudades) {
    if (civsEn.has(c.civilizacion)) continue;
    traducidas.push({ ...c });
    completadas++;
  }
  fs.writeFileSync(rutaEn, JSON.stringify(traducidas, null, 2) + '\n');
  if (completadas) console.log('ciudades inglesas completadas:', completadas);
}
console.log('ciudades añadidas:', n, '| total:', ciudades.length);
if (ignoradas.size) console.log('ids ignorados:', [...ignoradas].join(', '));
if (sinCiudad.length) console.log('sin ciudad:', sinCiudad.map((c) => c.id).join(', '));
