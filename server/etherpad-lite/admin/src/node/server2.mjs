import express from 'express';
import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;
import { PDFDocument,rgb } from 'pdf-lib';
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


// Función para encontrar las coordenadas del patrón en el pdf
const encontrar_coordenadas = async (pdfPath, patron) => {
try {
    const loadingTask = getDocument(pdfPath);
    const pdfDoc = await loadingTask.promise;
    const coords = [];

    for (let i = 0; i < pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i + 1); // Obtenemos las páginas del PDF
    const textContent = await page.getTextContent(); // Obtenemos el texto de cada página del PDF
    
    //Se obtine el texto
    for (const item of textContent.items) { // Recorremos cada texto en el archivo PDF
        if (item.str.includes(patron)) {
        // Obtener las coordenadas del texto
        const x = item.transform[4];
        const y = item.transform[5];
        
        // Calcular el tamaño del patron y añadir un margen adicional
        const width = item.width || 0; //tendrá valor de cero si el patron no tiene anchura
        const height = item.height || 0; //tendrá valor de cero si el patron no tiene altura

        // Ajuste para cubrir los corchetes y otros elementos visuales
        const margin = 10; // Margen adicional para incluir los corchetes

        coords.push({
            patron,
            page: i + 1,
            x: x - margin,
            y: y - margin,
            width: width + 2 * margin, //width: width + (2 * margin)
            height: height + 2 * margin
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
          pdfPage.drawRectangle({
            x: x, // Posición x del patrón
            y: y, // Posición y del patrón
            width: patronWidth, // Tamaño del patrón en el ancho
            height: patronHeight, // Tamaño del patrón en la altura
            color: rgb(1, 1, 1), // Color blanco para borrar el patrón
            borderWidth: 0
          });
    
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
