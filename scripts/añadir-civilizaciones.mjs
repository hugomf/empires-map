/** Añade civilizaciones nuevas al catálogo JSON (fuente de verdad). */
import fs from 'node:fs';
import path from 'node:path';

const dir = '/Users/hugo/Projects/empires-map/datos';
const leer = (n) => JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8'));
const escribir = (n, v) => fs.writeFileSync(path.join(dir, n), JSON.stringify(v, null, 2) + '\n');

const C = [
 {
 id: 'vikingos', nombre: 'Vikingos (Norse)', abrev: 'VIK', tipo: 'pueblo', region: 'escandinavia',
 inicio: 750, fin: 1066, apogeo: [850, 1010], declive: [1040, 1066], peso: 6, territorio: false,
 color: '#7f93a8',
 sintesis: 'Navegantes de Escandinavia que bajaron al mar con drakkars, saquearon desde Lisboa hasta Constantinopla y fundaron colonias en Islandia, Groenlandia y las Islandas Feroe.',
 caida: 'LasImprovisas cruzadas del norte, la adopción del cristianismo y la batalla de Stamford Bridge en 1066 acabaron con su expansión, aunque su lengua y su cultura de navegación sobrevivieron.',
 legado: 'El runes, los tesoros de oro de Sutton Hoo, los viajes de Leif Erikson a Vinland y las ciudades andas en Normandía e Irlanda.',
 hitos: [[793, 'Saqueo del monasterio de Lindisfarne.'], [874, 'Colonización de Islandia.'], [985, ' Erik el Rojo funda Groenlandia.'], [1000, 'Leif Erikson alcanza Vinland.'], [1066, 'Batalla de Stamford Bridge.']],
 terr: [
 ['Escandinavia', [14, 62], 750, 1066, [[4.5, 58.5], [8, 63], [12, 65], [18, 68], [24, 71], [31, 70], [30, 64], [22, 60], [13, 55], [8, 57], [4.5, 58.5]]],
 ['Islandia y Groenlandia', [-25, 66], 874, 1066, [[-24, 64.5], [-14, 66.5], [-22, 72], [-45, 78], [-58, 76], [-52, 68], [-40, 63], [-24, 64.5]]],
 ['Normandía y Dublín', [-4, 51], 841, 1066, [[-8, 48], [-1, 49], [-6, 54], [-11, 53], [-8, 48]]],
 ],
 },
 {
 id: 'celtas', nombre: 'Celtas', abrev: 'CEL', tipo: 'pueblo', region: 'europa-occidental',
 inicio: -800, fin: 400, apogeo: [-300, 50], declive: [100, 400], peso: 4, territorio: false,
 color: '#7f9f7f',
 sintesis: 'Dese del celta: pueblos de habla celta que ocuparon desde Irlanda hasta los Balcanes, con una cultura de oppida,rewriting de hierro y una religión druídica de los ciclos.',
 caida: 'La expansión de Roma, la romanización de las Galias y la officiallyBorder del Danubio acabaron con su mundo; sólo en Irlanda y Gales sobrevivieron algo de su lengua.',
 legado: 'La literatura celta, las cruces de piedra de Stonehenge y la Eisteddfod, las monedas de oro y el canto de los bardos.',
 hitos: [[-800, 'Expansión celta por Europa occidental.'], [-500, 'Construcción de Stonehenge.'], [-100, 'Los galos atacan Roma.'], [400, 'Última resistencia celta en la Galia.']],
 terr: [
 ['Atlántico celta', [-6, 53], -800, 400, [[-10, 51], [-4, 53], [-5, 57], [-8, 58], [-11, 54], [-10, 51]]],
 ['Galicia y Britania', [-3, 52], -800, 400, [[-9, 43], [-1, 43], [2, 50], [-2, 55], [-6, 53], [-9, 48], [-9, 43]]],
 ],
 },
 {
 id: 'bulgaros', nombre: 'Primer Imperio Búlgaro', abrev: 'BUL', tipo: 'imperio', region: 'balcanes',
 inicio: 681, fin: 1018, apogeo: [800, 900], declive: [970, 1018], peso: 5, territorio: true,
 color: '#b06a9f',
 sintesis: 'El primer Estado búlgaro, formado por los Eslavos y los Protobúlgaros en el Danubio: un-multiétnico imperio con una Iglesia eslava propia y una cultura de oro de Preslav.',
 caida: 'Las incursiones húngaras, la caída delbizantino y el auge de Kiev y los magiares fueron minando su territorio hasta la invasión de Basilio II en 1018.',
 legado: 'El alfabeto cirílico, la arquitectura de Preslav y Pliska y la primera prosa eslava.',
 hitos: [[681, 'Asparuh funda el imperio búlgaro.'], [864, 'Conversión al cristianismo.'], [893, 'El glorioso auge de Simeón.'], [1018, 'Basilio II destruye el imperio.']],
 },
 {
 id: 'hungaros', nombre: 'Húngaros (Magiares)', abrev: 'MAG', tipo: 'pueblo', region: 'europa-central',
 inicio: 895, fin: 2026, apogeo: [1000, 1100], declive: [1300, 1526], peso: 5, territorio: false,
 color: '#c96a5f',
 sintesis: 'Nómadas de origen ugro que se asentaron en la llanura húngara en 895 y fundaron un reino con una élite militarclient de la nobleza, la corona de San Esteban y una cultura de caballería.',
 caida: 'La tormenta mongola de 1241, las guerras internas y el ascenso de los Habsburgo redujeron su independencia en 1526, hasta la unificación austro-húngara de 1867.',
 legado: 'El húngaro, la cocina de paprika y goulash, la música de Zoltán Kodály y los colores rojo, blanco y verde.',
 hitos: [[895, 'Asentamiento magiar en la llanura húngara.'], [1000, 'Coronación de San Esteban.'], [1241, 'Invasión mongola.'], [1526, 'Derrota de Mohács.'], [1867, 'Compromiso austro-húngaro.']],
 terr: [['Llanura húngara', [19.5, 47.2], 895, 2026, [[16.2, 45.8], [19, 45.5], [22.5, 46.2], [23, 48.2], [20.5, 49.2], [17.5, 48.6], [16.2, 45.8]]]],
 },
 {
 id: 'lituanos', nombre: 'Gran Ducado de Lituania', abrev: 'LIT', tipo: 'estado', region: 'europa-central',
 inicio: 1253, fin: 1795, apogeo: [1400, 1550], declive: [1600, 1795], peso: 4, territorio: true,
 color: '#a85f4f',
 sintesis: 'El último Estado pagano de Europa: una grandeza ducal báltica que se expandió desde Lithuania hasta las puertas de Moscú, con una nobleza de carácter militar y el Estatuto de Lituania de 1529.',
 caida: 'La Unión de Lublin de 1569 refundió Lituania con Polonia y la perdió, y las particiones de Rusia y Prusia a finales del siglo XVIII acabaron con el Estado.',
 legado: 'La encyclopédie del Wisła, la statua de la libertad de Vilnius y la tradición del Lietuva.',
 hitos: [[1253, 'Mindaugas se corona.'], [1382, 'Unión con Polonia.'], [1410, 'Derrota de la Batalla de Grunwald.'], [1569, 'Unión de Lublin.'], [1795, 'Particiones.']],
 },
 {
 id: 'polacos', nombre: 'Polonia (Piast–Jagiełło)', abrev: 'POL', tipo: 'reino', region: 'europa-central',
 inicio: 960, fin: 1795, apogeo: [1380, 1570], declive: [1650, 1795], peso: 4, territorio: true,
 color: '#d4a05f',
 sintesis: 'El reino de los Piast y los Jagiełło, que se extendió del Oder al Dnéper y al Báltico: un país de la Commonwealth de dos naciones con una nobleza de gran escala y una cultura del Saraceno.',
    caida: 'Las particiones de 1772, 1793 y 1795 —Prusia, Rusia y Austria— borraron el reino del mapa; sólo sobrevivió un Estado fantasma.',
 legado: 'La arquitectura renacentista de Cracovia, la crisis de las Outcome, la cocina polaca y las costumbres de la szlachta.',
 hitos: [[960, 'Fundación de laPiast dynasty.'], [1380, 'Unión con Lituania.'], [1410, 'Grunwald.'], [1569, 'Unión de Lublin.'], [1795, 'Tercera partición.']],
 },
 {
 id: 'tibet', nombre: 'Imperio Tibetano', abrev: 'TIB', tipo: 'imperio', region: 'mongolia',
 inicio: 618, fin: 842, apogeo: [750, 800], declive: [820, 842], peso: 5, territorio: true,
 color: '#d4b07f',
 sintesis: 'El imperio de Songtsen Gampo, que unificó el Tíbet y se extendió desde el Tibet hasta el Tarim: un país del budismo vajrayana, con los monasterios de Samburu y una escritura propia.',
 caida: 'La guerra civil de 842 y el asesinato de Langdarma marking el final del imperio; el Tíbet quedó dividido entre reinos menores.',
 legado: 'El budismo vajrayana y sus tormas, los manuscritos de Dunhuang y la pintura tibetana.',
 hitos: [[618, 'Songtsen Gampo unifica el Tíbet.'], [635, 'Matrimonio con China.'], [792, 'Fundación del budismo vajrayana.'], [842, 'Fin del imperio.']],
 },
 {
 id: 'majapahit', nombre: 'Majapahit', abrev: 'MJP', tipo: 'imperio', region: 'indochina',
 inicio: 1293, fin: 1527, apogeo: [1350, 1450], declive: [1470, 1527], peso: 5, territorio: true,
 color: '#5fc9a8',
 sintesis: 'El imperio sundanés que unificó Java y.domina el archipiélago malayo: un poder maritime con elahanapi ART, el Código deptive Laws y laDrivers ramayana en Bali.',
 caida: 'La expansión de Aceh, el ducado de Demak y luego la presencia portuguesa acabaron con su centro, aunque su cultura se extendió por todo el archipiélago.',
 legado: 'El candi de los sugares, la trama de batik, el wayang y lafiltration del agua de la piscina.',
 hitos: [[1293, 'Raden Wijaya funda el reino.'], [1350, 'Apogeo de la expansión naval.'], [1513, 'Alfonso de Albuquerque toma Malaca.'], [1527, 'Caída de Trowulan.']],
 },
 {
 id: 'maratha', nombre: 'Imperio Maratha', abrev: 'MAR', tipo: 'imperio', region: 'india',
 inicio: 1674, fin: 1818, apogeo: [1740, 1760], declive: [1780, 1818], peso: 5, territorio: true,
 color: '#d46a4f',
 sintesis: 'La confederación maratha que salió de la India occidental y llegó a Delhi: Shivaji y sus sucesores combinaron la caballería ligerista, el fuego greco y laadministración de un ejército de miles de hombres.',
 caida: 'Las tres guerras contra Gran Bretaña, la muerte de Peshwa Baji Rao II y la ocupación británica de laBombaypartition acabaron con su poder.',
 legado: 'El datatype de Shivaji, la nueva capital de Pune y las GHAT de Maharashtra.',
 hitos: [[1674, 'Shivaji se corona.'], [1737, 'Entrada en Delhi.'], [1761, 'Terceira batalla de Panipat.'], [1818, 'Derrota de Baji Rao II.']],
 },
 {
 id: 'sikh', nombre: 'Imperio Sij', abrev: 'SIJ', tipo: 'estado', region: 'india',
 inicio: 1799, fin: 1849, apogeo: [1820, 1839], declive: [1846, 1849], peso: 4, territorio: true,
 color: '#d4b34f',
 sintesis: 'El Estado sij del Punjeb, formado por las， trinidades de la misticidad y la espada: un ejército de la guarnición de la Mando de Guru Nanak que llegó a conquistar el Noroeste indio.',
 caida: 'Las dos guerras anglosijhes, la anexión del Punjab en 1849 y el relevo del mando militar por la Companyía anorexia consumaron su caída.',
 legado: 'El Templo de Harmandir Sahib de Amritsar, el Khanda, la replete cocina punjabi y los S.',
 hitos: [[1799, 'Maharaja Ranjit Singh unifica el Punjeb.'], [1821, 'Fundación de Amritsar.'], [1839, 'Toma de Múltan y Cachemira.'], [1849, 'Anexión británica del Punjeb.']],
 },
 {
 id: 'himyaritas', nombre: 'Himyaritas (Saba)', abrev: 'HIM', tipo: 'reino', region: 'arabi',
 inicio: -300, fin: 525, apogeo: [-100, 300], declive: [400, 525], peso: 4, territorio: true,
 color: '#c9a05f',
 sintesis: 'El reino de la)’ Arabia del sur, con capital en Zafar y luego Marib: un gran tronco commercial del incienso y la mirra entre la India, Roma y África.',
 caida: 'La astrayación del Aksum de Aksum en el siglo VI y la posterior independencia del Nothing Corrupted rompieron su mundo.',
 legado: 'Los canales de riego de Marib, la escritura sabáica y los monopolios de Yemen.',
 hitos: [[-300, 'Fundación del reino himyarita.'], [100, 'Moneda y comercio con Roma.'], [275, 'Conversión al judaísmo.'], [525, 'Invasión aksumita.']],
 },
 {
 id: 'coreas', nombre: 'Tres Reinos de Corea', abrev: 'TRC', tipo: 'confederacion', region: 'corea',
 inicio: -37, fin: 668, apogeo: [400, 550], declive: [600, 668], peso: 5, territorio: true,
 color: '#7fb8d4',
 sintesis: 'Goguryeo, Baekje y Silla, que disputaron la península coreana durante siete siglos y la unificaron finalmente en 668 con la ayuda de Tang.',
 caida: 'La unificación forzada de Silla y la posterior presión de Anap sobre todo el reino.',
 legado: 'Los budismos de la takers, las Influences del período unificado, los.prefix funerarios y los Guardianes de los Sellos Reales de Silla.',
 hitos: [[-37, 'Fundación de Goguryeo.'], [372, 'Unificación de la península por Goguryeo.'], [668, 'Silla unifica la península.']],
 },
 {
 id: 'benin', nombre: 'Reino de Benín', abrev: 'BEN', tipo: 'reino', region: 'africa-occidental',
 inicio: 1180, fin: 1897, apogeo: [1500, 1700], declive: [1897, 1897], peso: 4, territorio: true,
 color: '#c98a4f',
 sintesis: 'El reino de la ciudad de Benín, en la costa de Nigeria: un Estado centralizado con un ejército de miles, los bronces de Benín y un sistema de comercio con Portugal.',
 caida: 'La expedición?family de 1897, que saqueó la ciudad yQUEUE la-Share de su ExecDirectora, destruyó el reino y convirtió su territorio en la Colonia de Nigeria.',
 legado: 'Los bronces de Benín, la cultura de Ife y la memoria de la corona oba.',
 hitos: [[1180, 'Fundación del reino.'], [1480, 'Los portugueses llegan a Benín.'], [1550, 'Embrasement de los bronces de Benín.'], [1897, 'ExpediciónBritish del Britain y saqueo.']],
 },
 {
 id: 'chimu', nombre: 'Reino Chimú', abrev: 'CHM', tipo: 'reino', region: 'andes',
 inicio: 900, fin: 1470, apogeo: [1200, 1400], declive: [1450, 1470], peso: 4, territorio: true,
 color: '#d4a05f',
 sintesis: 'El kingdom de la costa norte del Perú, con capital en Chan Chan, la mayor ciudad de adobe del mundo: un Artesanía famosa de la cerámica y los textiles.',
 caida: 'La expansión del Chimú ruled por Túpac Yupanqui y luego la conquista inca de 1470 acabaron con el reino y con su capital.',
 legado: 'Las murallas de adobe de Chan Chan, los ponchos y la cerámica chimú de la Bird’s fish.',
 hitos: [[900, 'Fundación de Chan Chan.'], [1200, 'Apogeo del reino.'], [1470, 'Conquista inca.']],
 },
 {
 id: 'wari', nombre: 'Estado Wari (Huari)', abrev: 'WAR', tipo: 'imperio', region: 'andes',
 inicio: 600, fin: 1000, apogeo: [700, 900], declive: [900, 1000], peso: 5, territorio: true,
 color: '#c96a4f',
 sintesis: 'El primer Estado panandino de los Andes centrales, con capital en Huari y una red de caminos que unía el altiplano con la costa: un imperio Early accesible a la forastería del Its.',
 caida: 'La crisis del siglo X, las de Wari y el auge de los reinos aimaras y luego de los incas acabaron con su Federal.',
 legado: 'Los tapices de Huari, la influencia de Tikal y el estilo provincial de la cerámica.',
 hitos: [[600, 'Se funda Huari.'], [750, 'Apogeo del imperio.'], [900, 'Crisis y declive.'], [1000, 'Fin del Estado wari.']],
 },
 {
 id: 'xiongnu', nombre: 'Xiongnu', abrev: 'XIO', tipo: 'confederacion', region: 'mongolia',
 inicio: -209, fin: 155, apogeo: [-200, 100], declive: [100, 155], peso: 5, territorio: true,
 color: '#b0a08f',
 sintesis: 'La primera confederación de las estepas eurasiáticas: jinetes de la estepa que dominaron la stepa desde Mongolia hasta el Danubio y enfrentaron a China y Roma.',
 caida: 'La disolución de los Xiongnu Meras, la expansión de los Han y la migración de sus grupos hacia el oeste sembraron los pueblos que luego seriam hunos y turcos.',
 legado: 'El arco compuesto, la guerra de la estepa, la primera globalización de las rutas de la seda y el misterio de los Tumba de Noin.',
 hitos: [[-209, 'Modu Chanyu unifica la confederación.'], [-200, 'Guerra contra China.'], [-100, 'Envío de Zhang Qian.'], [155, 'Dispersión de los grupos xiongnu.']],
 },
 {
 id: 'liao', nombre: 'Dinastía Liao (Khitan)', abrev: 'LIA', tipo: 'dinastia', region: 'mongolia',
 inicio: 916, fin: 1125, apogeo: [1000, 1050], declive: [1115, 1125], peso: 4, territorio: true,
 color: '#a08fb0',
 sintesis: 'El imperio dual de los khitan: un Desde tribal en la estepa y una administración china en las Liao del norte, con un sistema de citizenship de dosWake que lo hacía único.',
 caida: 'Ladinastía de los jin de los jurchenes lo destruyó en 1125, pero su cultura y su lengua se fundieron con los mongoles posteriores.',
 legado: 'La escritura khitan, los túmulos de los príncipes, el violín de dos cuerdas y la cerámica de la‛ dinastía Liao.',
 hitos: [[916, 'Abas, el fundador de los khitan.'], [1004, 'Chino ha unsettled: Song declara la guerra.'], [1125, 'Cae ante los jurchenes.']],
 },
 {
 id: 'jurchen', nombre: 'Dinastía Jin (Jurchenes)', abrev: 'JIN', tipo: 'dinastia', region: 'mongolia',
 inicio: 1115, fin: 1234, apogeo: [1150, 1200], declive: [1211, 1234], peso: 5, territorio: true,
 color: '#c9b07f',
 sintesis: 'El imperio de los jurchenes, pueblo de hunters de Manchuria que conquistó el norte de China y `%`/`Sdk` Building’un DEPARTMENT sobre Song, y que fue a su vez barrido por los mongoles.',
 caida: 'La invasión mongola de 1211-1234, la caída de overhear y la traición de su propio general, acabaron con el imperio y con la Dinastía Song.',
 legado: 'El violín de dos cuerdas y el arte jurchen, la laws de Hangzhou y la cultura que convivió con los Song.',
 hitos: [[1115, 'Wanyan Aguda funda la dinastía.'], [1127, 'Caída de Kaifeng y del norte de Song.'], [1211, 'Invasión mongola.'], [1234, 'Fin del imperio.']],
 },
];

const civilizaciones = leer('civilizaciones.json');
const hitos = leer('hitos.json');
const territorios = leer('territorios.json');

const nuevos = C.filter((c) => !civilizaciones.some((x) => x.id === c.id));
if (nuevos.length !== C.length) {
 console.log('omitidos (ya existen):', C.filter((c) => civilizaciones.some((x) => x.id === c.id)).map((c) => c.id).join(', '));
}

for (const c of nuevos) {
 const { hitos: hs, terr,...resto } = c;
 civilizaciones.push({...resto, hitos: [] });
 hs.forEach((h, i) => hitos.push({ id: `${c.id}-${i + 1}`, civilizacion: c.id, anio: h[0], texto: h[1] }));
 (terr ?? []).forEach((t, i) => {
 territorios.push({
 id: `${c.id}-t${i + 1}`,
 civilizacion: c.id,
 tipo: 'tierra',
 nombre: t[0],
 ancla: [t[1][0], t[1][1]],
 desde: t[2],
 hasta: t[3],
 anillos: [t[4]],
 });
 });
}

escribir('civilizaciones.json', civilizaciones);
escribir('hitos.json', hitos);
escribir('territorios.json', territorios);
console.log('añadidas:', nuevos.map((c) => c.id).join(', '));
console.log('total civilizaciones:', civilizaciones.length);
