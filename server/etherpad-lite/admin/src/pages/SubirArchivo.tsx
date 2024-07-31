import { useState } from 'react';
import axios from 'axios';

export default function SubirArchivo() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState<string>('');

  const handleCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!archivo) {
      setMensaje('Por favor, selecciona un archivo PDF.');
      return;
    }

    const datosFormulario = new FormData();
    datosFormulario.append('archivo', archivo);

    try {
      await axios.post('http://localhost:2001/subirArchivo', datosFormulario, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Archivo subido exitosamente.');
    } catch (error) {
      console.error('Error al subir el archivo', error);
      setMensaje('Error al subir el archivo.');
    }
  };

  return (
    <div>
      <h1>Subir Archivo PDF</h1>
      <form onSubmit={handleEnvio} encType="multipart/form-data">
        <label htmlFor="pdf">Selecciona un archivo PDF:</label>
        <input
          type="file"
          id="pdf"
          name="pdf"
          accept="application/pdf"
          onChange={handleCambioArchivo}
        />
        <button type="submit">Subir</button>
      </form>
      <p>{mensaje}</p>
    </div>
  );
}
