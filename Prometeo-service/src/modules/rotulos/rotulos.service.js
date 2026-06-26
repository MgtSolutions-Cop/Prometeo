import sharp from "sharp";
import QRCode from "qrcode";
import fs from "fs/promises";
import path from "path";

// Variables globales para la URL del QR (luego puedes usar .env)
const PROMETEO_DOMAIN = process.env.PUBLIC_VERIFICATION_URL || "https://prometeofile.com/verificar";

export async function createStickerPNG({ 
    radicationNumber, 
    date, 
    destinoText, 
    anexosText, 
    entidad = "AGENCIA DISTRITAL PARA LA EDUCACIÓN SUPERIOR,\nLA CIENCIA Y LA TECNOLOGÍA" 
}) {
  
  // 1. Dimensiones del Sticker (ej. 450x200px)
  const WIDTH = 450;
  const HEIGHT = 200;

  const blank = {
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 3,
      background: { r: 255, g: 255, b: 255 } // Fondo blanco
    }
  };

  // 2. Generar el Código QR
  // La URL será algo como: https://prometeo.com/verificar/8-2025-6564
  const verificationUrl = `${PROMETEO_DOMAIN}/${radicationNumber}`;
  
  const qrBuffer = await QRCode.toBuffer(verificationUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 130, // Tamaño del QR
    color: {
      dark: '#000000',  // Puntos negros
      light: '#FFFFFF'  // Fondo blanco
    }
  });

  // 3. Generar el texto en formato SVG para que quede súper nítido
  // Ajustamos las posiciones X para que el texto quede a la derecha del QR
  const textX = 145; // Empieza después de los 130px del QR
  
  const svgText = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .bold-title { font-size: 14px; font-weight: bold; fill: #000; font-family: Arial, sans-serif; }
        .subtitle { font-size: 11px; fill: #000; font-family: Arial, sans-serif; }
        .normal { font-size: 13px; fill: #000; font-family: Arial, sans-serif; }
        .bold-normal { font-size: 13px; font-weight: bold; fill: #000; font-family: Arial, sans-serif; }
      </style>

      <text x="${textX}" y="30" class="bold-title">ALCALDÍA MAYOR DE BOGOTÁ</text>
      <text x="${textX}" y="50" class="subtitle">AGENCIA DISTRITAL PARA LA EDUCACIÓN SUPERIOR,</text>
      <text x="${textX}" y="65" class="subtitle">LA CIENCIA Y LA TECNOLOGÍA</text>

      <text x="${textX}" y="95" class="subtitle">AL RESPONDER CITAR EL NR.</text>
      
      <text x="${textX}" y="125" class="normal">Nro. Rad: <tspan class="bold-normal">${radicationNumber}</tspan></text>
      <text x="${textX}" y="150" class="normal">Fecha: ${date} - Anexos: ${anexosText}</text>
      <text x="${textX}" y="175" class="normal">Destino: <tspan class="bold-normal">${destinoText}</tspan></text>
    </svg>
  `;

  const svgBuffer = Buffer.from(svgText);

  // 4. Unir todo (El QR a la izquierda, el texto a la derecha)
  const finalImage = await sharp(blank)
    .composite([
      { input: qrBuffer, top: 35, left: 10 }, // QR centrado a la izquierda
      { input: svgBuffer, top: 0, left: 0 }   // Texto posicionado globalmente
    ])
    .png()
    .toBuffer();

  // 5. Guardar el archivo físicamente en la carpeta 'storage/stickers'
  const stickersDir = path.resolve("storage", "stickers");
  await fs.mkdir(stickersDir, { recursive: true });

  const filename = `${radicationNumber}.png`;
  const filepath = path.join(stickersDir, filename);

  await fs.writeFile(filepath, finalImage);

  // Devolvemos la información del sticker
  return {
    filename,
    filepath,
    url: `/api/rotulos/ver/${filename}` // Futura ruta protegida de tu módulo
  };
}