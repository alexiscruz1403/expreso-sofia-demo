# Expreso Sofía · Demo plataforma de pasajes

Demo navegable (propuesta comercial) construida a partir de los diseños de `design/`.
Todos los datos son ficticios y están hardcodeados. Los cambios (compras, reprogramaciones,
cancelaciones, check-ins, etc.) viven **solo en memoria** y se pierden al recargar la página.

## Vistas

- **Pasajero**: búsqueda, asientos, datos, pago MercadoPago simulado, boleto, Mis pasajes, reprogramación, cancelación, contacto.
- **Admin**: dashboard, viajes, detalle de viaje, líneas, tarifas, unidades, pagos, cambios, usuarios.
- **Ventas**: venta en mostrador, reprogramar/cancelar, viajes, historial, cierre de caja.
- **Staff**: viajes del día, pasajeros por parada, mapa de asientos, escaneo de boletos.
- **Login**: cuentas de demo con contraseña `sofia2026`.

Todas las vistas son responsive (mobile, tablet y desktop). La barra inferior permite cambiar de rol y el panel **Escenarios** simula el resultado del pago, un viaje agotado, un viaje cancelado o una reserva vencida.

## Reglas comerciales implementadas

- **Cancelación y reprogramación**, retención según anticipación a la salida: más de 48 h → 10%; entre 24 y 48 h → 20%; dentro de las 24 h → 30%.
- **Reprogramación**: solo hasta 3 h antes de la salida (más la diferencia de tarifa, si la hay).
- **Tarjeta de crédito**: los pasajes pagados con tarjeta de crédito no admiten devolución (sí reprogramación).
- **Ida y vuelta**: no admite devolución, cambios ni reutilización; validez de 14 días corridos desde la emisión.
- **Viaje cancelado por la empresa**: reintegro total o reprogramación sin cargo.
- **Equipaje**: una valija y/o bolso en bodega + una mochila dentro del coche.

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + build en dist/
npm run preview
```

## Deploy en Vercel

Importar el repositorio en Vercel. `vercel.json` ya define el framework (Vite), el comando de build y la carpeta `dist`, o bien ejecutar `npx vercel --prod`.

## Estructura

- `src/data/sofia.ts`: capa de datos en memoria (líneas, tarifas, viajes, asientos, pasajes, políticas).
- `src/views/*.tsx`: vistas portadas de `design/*.dc.html` (Shell, Publico, Admin, Ventas, Staff, SeatMap, Boleto).
- `src/lib/dc.ts`: helpers para usar los estilos inline del diseño en JSX.
- `public/assets/`: imágenes.
