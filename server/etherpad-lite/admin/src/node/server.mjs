import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import { PDFDocument,rgb } from 'pdf-lib';
import bodyParser from 'body-parser';
import formidable from 'formidable';
import pdfjs from 'pdfjs-dist';
const { getDocument } = pdfjs;
import sharp from 'sharp';



// Crea una instancia de Express
const app = express();

// Configuración de la base de datos
const pool = new Pool({
  user: 'etherpad',
  host: 'localhost',
  database: 'etherpad',
  password: 'etherpad',
  port: 5432,
});

// Función para crear tablas si no existen
const crearTablasSiNoExisten = async () => {
  const consultaCrearTablaPdfFiles = `
    CREATE TABLE IF NOT EXISTS pdf_files (
      id SERIAL PRIMARY KEY,
      documento VARCHAR(255),
      carpeta VARCHAR(255),
      tipo_documento VARCHAR(50),
      descripcion TEXT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      file_path VARCHAR(255)
    );
  `;

  const consultaCrearTablaPdfFilesFirmado = `
    CREATE TABLE IF NOT EXISTS pdf_file_firmado (
      id SERIAL PRIMARY KEY,
      documento_padre INTEGER,
      nombre_documento_padre VARCHAR(255),
      archivo VARCHAR(255),
      carpeta VARCHAR(255),
      version VARCHAR(255),
      descripcion TEXT,
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(consultaCrearTablaPdfFiles);
  await pool.query(consultaCrearTablaPdfFilesFirmado);
};

crearTablasSiNoExisten().catch(console.error);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de rutas PARA GUARDAR EL ARCHIVO QUE SE RECIBE EN EL MÉTODO POST
const __dirname = path.resolve(); // PARA AGREGARLAS DEMÁS CARPETAS QUE SE CONFIGUREN
const directorioGuardarMedia = path.join(__dirname, '../media');
const directorioArchivos = path.join(__dirname, '../media/archivos');
const directorioFirmas = path.join(__dirname, '../media/firmas_generadas');

if (!fs.existsSync(directorioGuardarMedia)) {
  fs.mkdirSync(directorioGuardarMedia);
}
if (!fs.existsSync(directorioArchivos)) {
  fs.mkdirSync(directorioArchivos);
}
if (!fs.existsSync(directorioFirmas)) {
  fs.mkdirSync(directorioFirmas);
}

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, directorioArchivos);
  },
  filename: (req, file, cb) => {
    const filename = file.originalname;
    cb(null, filename);

    // Almacena la ruta total del archivo
    req.rutatotalArchivo = path.join(directorioArchivos, filename);

    // Almacena la ruta relativa del archivo
    req.rutarelativaArchivo = path.relative(__dirname, path.join(directorioArchivos, filename));
  }
});

const upload = multer({ storage });


// Manejo del método POST DE SUBIR EL ARCHIVO
app.post('/subirArchivo', upload.single('archivo'), (req, res) => {
  if (!req.file) {
    res.status(400).send('No se subió ningún archivo');
    return;
  }

  const nombreArchivo = path.basename(req.file.filename, path.extname(req.file.filename));
  const nombreCarpeta = path.basename(directorioArchivos);
  const tipoDocumento = path.extname(req.file.filename).toLowerCase() === '.pdf' ? 'pdf' : null;
  const rutaArchivo = req.rutarelativaArchivo;

  pool.query(
    'INSERT INTO pdf_files (documento, carpeta, tipo_documento, descripcion, file_path, patron_presente) VALUES ($1, $2, $3, $4, $5, $6)',
    [nombreArchivo, nombreCarpeta, tipoDocumento, null, rutaArchivo, true],
    (dbErr) => {
      if (dbErr) {
        return res.status(500).send('Error al guardar la información del archivo en la base de datos');
      }
      
      res.status(200).send('Archivo subido exitosamente');
    }
  );

  //cargarPDF(rutaArchivo); // Llama a la función para cargar el PDF
});

// Manejo del backend de la solicitud GET
app.get('/firmar', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pdf_files WHERE tipo_documento != $1 AND patron_presente != $2', ['Firma',false]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener los registros de la base de datos:', error);
    res.status(500).send('Error al obtener los registros de la base de datos');
  }
});

// Manejo de la solicitud POST para subir el archivo ya firmado
app.post('/subirArchivoFirmado', (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
    try {
      // Obtener los datos del formulario
      const firma_data_url = fields.firma[0]; // Firma en base64
      const identificador = fields.identificador[0];
      const carpeta = fields.carpeta[0];
      const documentoContrato = fields.documento[0];
      const documentoId = fields.documentoId[0];

      if (!firma_data_url) {
        return res.status(400).json({ error: 'Falta la firma en la solicitud.' });
      }
      if (!identificador) {
        return res.status(400).json({ error: 'Falta el identificador en la solicitud.' });
      }
      if (!documentoContrato) {
        return res.status(400).json({ error: 'Falta proporcionar documento (nombre del archivo) en la solicitud.' });
      }
      if (!documentoId) {
        return res.status(400).json({ error: 'Falta el ID del documento en la solicitud.' });
      }
   
      // Decodificar la firma y guardarla como archivo
      const [formato, imgstr] = firma_data_url.split(';base64,');
      const ext = formato.split('/').pop(); //extensión de la imagen
      const buffer = Buffer.from(imgstr, 'base64'); //imagen tipo bit64
      const fileName = `firmaUsuario_documento:${documentoContrato}.${ext}`;

      const ubicacionParaGuardarFirma = path.join(directorioFirmas, fileName);

      // Convertir la imagen a PNG y guardar en la ubicación especificada
      sharp(buffer)
      .toFormat('png')
      .toFile(ubicacionParaGuardarFirma, (err, info) => {
        if (err) {
          console.error('Error al guardar la firma:', err);
        } else {
          console.log('Firma guardada exitosamente:', info);
        }
      });


      

      // Obtener la nueva versión del documento
      const obtenerCantidadYVersion = async () => {
        try {
          const result = await pool.query(
            'SELECT COUNT(*) AS count FROM pdf_file_firmado WHERE documento_padre = $1',
            [documentoId]
          );
          const cantidadArchivos = parseInt(result.rows[0].count, 10);
          return `V${cantidadArchivos + 1}`;
        } catch (err) {
          console.error('Error ejecutando la consulta', err);
          throw err;
        }
      };

      const nuevaVersion = await obtenerCantidadYVersion();

      // Obtener la ruta del archivo desde la base de datos
      const result = await pool.query('SELECT file_path FROM pdf_files WHERE documento = $1 AND carpeta = $2', [documentoContrato, carpeta]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }

      const rutaArchivoPdfOriginal = result.rows[0].file_path; // obtenemos el pdf original que tiene el patrón
      const pdf_output = rutaArchivoPdfOriginal; // ruta final del archivo ya firmado

      // Función para encontrar las coordenadas del patrón en el pdf
      const encontrar_coordenadas = async (pdfPath, patron) => {
        try {
          const loadingTask = getDocument(pdfPath);
          const pdfDoc = await loadingTask.promise;
          const coords = [];
      
          for (let i = 0; i < pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i + 1); // Obtenemos las páginas del PDF
            const textContent = await page.getTextContent(); // Obtenemos el texto de cada página del PDF
      
            for (const item of textContent.items) { // Recorremos cada texto en el archivo PDF
              if (item.str.includes(patron)) {
                // Obtener las coordenadas del texto
                const x = item.transform[4];
                const y = item.transform[5];
                
                // Calcular el tamaño del patron y añadir un margen adicional
                const width = item.width || 0; //tendrá valor de cero si el patron no tiene anchura
                const height = item.height || 0; //tendrá valor de cero si el patron no tiene altura
      
                // Ajuste para cubrir los corchetes y otros elementos visuales
                //const margin = 10; // Margen adicional para incluir los corchetes
      
                coords.push({
                  patron,
                  page: i + 1,
                  x: x , // x: x - margin
                  y: y ,//y - margin
                  width: width, // width + 2 * margin //width: width + (2 * margin)
                  height: height  //height + 2 * margin
                });
              }
            }
          }
      
          return coords;
        } catch (error) {
          console.error('Error al encontrar coordenadas:', error);
          throw error;
        }
      };
      
      
      

    // Obtener las coordenadas del patrón
    const coords = await encontrar_coordenadas(rutaArchivoPdfOriginal, identificador);
    console.log('Coordenadas encontradas:', coords);

    // Definimos la escala
    const escala = 0.4;

    // Agregar firma en el pdf
    const agregar_imagen_a_pdf = async (pdfPath, outputPath, firmaPath, coordenadas, escala) => {
      try {
        if (!Array.isArray(coordenadas)) {
          throw new TypeError('Las coordenadas proporcionadas no son un array.');
        }
    
        const pdfDoc = await PDFDocument.load(fs.readFileSync(pdfPath));
        const firmaImagen = await pdfDoc.embedPng(fs.readFileSync(firmaPath));
    
        const { width: imagenWidth, height: imagenHeight } = firmaImagen;
    
        for (const coord of coordenadas) {
          const { page: pageIndex, x, y, width: patronWidth, height: patronHeight } = coord;
          const pdfPage = pdfDoc.getPage(pageIndex - 1);
    
          // Calcular tamaño de la imagen con la escala aplicada
          const escalaWidth = imagenWidth * escala;
          const escalaHeight = imagenHeight * escala;
    
          // Ajustar el tamaño del rectángulo para cubrir completamente el patrón
          /*
          pdfPage.drawRectangle({
            x: x, // Posición x del patrón
            y: y, // Posición y del patrón
            width: patronWidth, // Tamaño del patrón en el ancho
            height: patronHeight, // Tamaño del patrón en la altura
            color: rgb(1, 1, 1), // Color blanco para borrar el patrón
            borderWidth: 0
          });
          */
    
          // Calcular el centro del área del patrón
          const patronCenterX = x + patronWidth / 2;
          const patronCenterY = y + patronHeight / 2;

   
    
          // Ajustar las coordenadas de la imagen para que esté centrada en el área del patrón
          pdfPage.drawImage(firmaImagen, {
            x: patronCenterX - (escalaWidth / 2),
            y: patronCenterY - (escalaHeight / 2),
            width: escalaWidth, 
            height: escalaHeight 
          });
    
          console.log(`Imagen añadida en página: ${pageIndex}, coordenadas: (x:${patronCenterX - (escalaWidth / 2)}, y: ${patronCenterY - (escalaHeight / 2)}), tamañoImg: (ancho: ${escalaWidth}, alto: ${escalaHeight})`);
        }
    
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);
        console.log('PDF firmado y guardado exitosamente');
    
        return { success: true };
      } catch (error) {
        console.error('Error al agregar imagen al PDF:', error);
        throw error;
      }
    };
    
    
    

    const guardar_pdfFirmado = async (pdfPath, outputPath, firmaPath, coordenadas, escala, documentoId, documentoContrato, carpeta, nuevaVersion) => {
      // Llamar a la función para agregar la imagen al PDF
      const resultado = await agregar_imagen_a_pdf(pdfPath, outputPath, firmaPath, coordenadas, escala);
      
      // Verificar si el proceso se realizó con éxito
      if (resultado.success) {
        try {
          // Guardar el documento firmado en la base de datos
          await pool.query('INSERT INTO pdf_file_firmado (documento_padre, nombre_documento_padre, archivo, carpeta, version, descripcion) VALUES ($1, $2, $3, $4, $5, $6)', [
            documentoId,
            documentoContrato,
            outputPath,
            carpeta,
            nuevaVersion,
            "Nueva versión con firma incorporada"
          ]);


          //cambiar el estado del patrón en el archivo pdf firmado (con esto indicamos que el patron para firmar ya no está en el pdf porque este se firmó)
          await pool.query('UPDATE pdf_files SET patron_presente = $1 WHERE id = $2', [
            false,
            documentoId
          ]);
          const firmaArchiBD = `Firma_generada_por_usuario_para_el_doc:${documentoContrato}`;

          // Guardar la firma en la base de datos
          const consultaBD = `
            INSERT INTO pdf_files (documento, carpeta, tipo_documento, descripcion, file_path)
            VALUES ($1, $2, $3, $4, $5)
          `;
          const values = [
            firmaArchiBD,
            carpeta,
            'Firma',
            documentoContrato,
            ubicacionParaGuardarFirma
          ];

          await pool.query(consultaBD, values);
     

          res.status(200).json({ success: 'PDF firmado y guardado exitosamente' });
          
          //console.log('Documento firmado guardado en la base de datos exitosamente');
        } catch (dbError) {
          console.error('Error al guardar en la base de datos:', dbError);
        }
      } else {
        console.error('No se pudo agregar la imagen al PDF:', resultado.error);
      }
    };
    
    await guardar_pdfFirmado(rutaArchivoPdfOriginal,pdf_output ,ubicacionParaGuardarFirma, coords,escala,documentoId,documentoContrato, carpeta, nuevaVersion);

      

} catch (err) {
    console.error('Error en el almacenamiento del archivo firmado', err);
    res.status(500).json({ error: 'Error al procesar la firma del documento' });
}
  });
});

const port = 2001;
// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
