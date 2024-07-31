import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import { PDFDocument } from 'pdf-lib';
import imageSize from 'image-size';
import bodyParser from 'body-parser';
import formidable from 'formidable';
import pdfjs from 'pdfjs-dist';
const { getDocument } = pdfjs;

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

const cargarPDF = async (ruta) => {
  try {
    const pdfBytes = fs.readFileSync(ruta);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    console.log('PDF cargado correctamente');
  } catch (error) {
    console.error('Error al cargar el PDF:', error);
  }
};

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
    'INSERT INTO pdf_files (documento, carpeta, tipo_documento, descripcion, file_path) VALUES ($1, $2, $3, $4, $5)',
    [nombreArchivo, nombreCarpeta, tipoDocumento, null, rutaArchivo],
    (dbErr) => {
      if (dbErr) {
        return res.status(500).send('Error al guardar la información del archivo en la base de datos');
      }

      res.status(200).send('Archivo subido exitosamente');
    }
  );

  cargarPDF(rutaArchivo); // Llama a la función para cargar el PDF
});

// Manejo del backend de la solicitud GET
app.get('/firmar', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pdf_files WHERE tipo_documento != $1', ['Firma']);
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
      const ext = formato.split('/').pop();
      const buffer = Buffer.from(imgstr, 'base64');
      const fileName = `firmaUsuario_documento:${documentoContrato}.${ext}`;
      const ubicacionParaGuardarFirma = path.join(directorioFirmas, fileName);

      // Guardar la firma en el servidor
      fs.writeFileSync(ubicacionParaGuardarFirma, buffer);

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
      console.log('Firma guardada en la base de datos');

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
      
          // Recorrer las páginas del PDF
          for (let i = 0; i < pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i + 1);
            const textContent = await page.getTextContent();
      
            // Buscar el patrón en el contenido de texto
            for (const item of textContent.items) {
              if (item.str.includes(patron)) {
                coords.push({ patron: patron, page: i + 1, x: item.transform[4], y: item.transform[5] });
              }
            }
          }
      
          return coords;
        } catch (error) {
          console.error('Error al encontrar coordenadas:', error);
          throw error;  // Re-lanzar el error para manejarlo en el contexto de la llamada
        }
      };
      

    // Obtener las coordenadas del patrón
    const coords = await encontrar_coordenadas(rutaArchivoPdfOriginal, identificador);
    console.log('Coordenadas encontradas:', coords);

    // Definimos la escala
    const escala = 0.5;

    // Agregar firma en el pdf
    const agregar_imagen_a_pdf = async (pdfPath, outputPath, firmaPath, coordenadas, escala) => {
      try {
        // Validar que 'coordenadas' es un array
        if (!Array.isArray(coordenadas)) {
          throw new TypeError('Las coordenadas proporcionadas no son un array.');
        }
    
        const pdfDoc = await PDFDocument.load(fs.readFileSync(pdfPath));
        const firmaImagen = await pdfDoc.embedPng(fs.readFileSync(firmaPath));
        
        // Obtener dimensiones originales de la imagen
        const { width: imagenWidth, height: imagenHeight } = firmaImagen;
    
        // Iterar sobre las coordenadas encontradas y añadir la firma
        for (const coord of coordenadas) {
          const { x, y, page } = coord;
          const pdfPage = pdfDoc.getPage(page - 1); // Nota: las páginas en PDF-lib están indexadas desde 0
          
          // Calcular tamaño de la imagen con la escala aplicada
          const width = imagenWidth * escala;
          const height = imagenHeight * escala;
    
          // Añadir la imagen en las coordenadas especificadas
          pdfPage.drawImage(firmaImagen, {
            x,
            y,
            width,
            height
          });
        }
    
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);
        console.log('PDF firmado y guardado exitosamente');

        // Indicar que la imagen se agregó correctamente
        return { success: true };

      } catch (error) {
        console.error('Error al agregar imagen al PDF:', error);
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
          console.log('Documento firmado guardado en la base de datos exitosamente');
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
