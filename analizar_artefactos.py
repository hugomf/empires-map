import json

data = json.load(open('datos/artefactos.json'))

types = {}
for item in data:
    tipo = item.get('tipo', 'desconocido')
    types[tipo] = types.get(tipo, 0) + 1

print('Distribución por tipo:')
for t, c in sorted(types.items()):
    print(f'  {t}: {c}')
print(f'Total: {len(data)}')

print('\nDistribución por civilización (top 10):')
civilizaciones = {}
for item in data:
    civ = item.get('civilizacion', 'desconocido')
    civilizaciones[civ] = civilizaciones.get(civ, 0) + 1

for civ, c in sorted(civilizaciones.items(), key=lambda x: x[1], reverse=True)[:10]:
    print(f'  {civ}: {c}')

print('\nDistribución por icono (top 15):')
iconos = {}
for item in data:
    icono = item.get('icono', 'desconocido')
    iconos[icono] = iconos.get(icono, 0) + 1

for icono, c in sorted(iconos.items(), key=lambda x: x[1], reverse=True)[:15]:
    print(f'  {icono}: {c}')