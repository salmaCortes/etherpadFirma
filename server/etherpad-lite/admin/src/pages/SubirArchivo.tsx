import { useState } from 'react';
import axios from 'axios';
import './css/subirArchivo.css';

export default function SubirArchivo() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState<string>('');
  const [modalConfirmArchiSubido, setModalConfirmArchiSubido] = useState<boolean>(false);
  const [modalsubirArchi, setModalsubirArchi] = useState<boolean>(true);

  const handleCambioArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivo(e.target.files[0]);
    }
  };

  const handleOK = () => {
    setModalConfirmArchiSubido(false);
    window.location.reload();
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
      const response = await axios.post('http://localhost:2001/subirArchivo', datosFormulario, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        setModalsubirArchi(false);
        setModalConfirmArchiSubido(true);
        console.log('Archivo subido exitosamente.');
      } else {
        console.error('Error en la respuesta del servidor', response);
      }
    } catch (error) {
      console.error('Error al subir el archivo', error);
    }
  };

  return (
    <>
      {modalsubirArchi && (
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1>Subir Archivo PDF</h1>
            </div>
            <div className="modal-body">
              <h3>Haga click en "Examinar" para subir un archivo PDF.</h3>
              <input
                className="form-control form-control-sm"
                id="formFileSm"
                type="file"
                name="pdf"
                accept="application/pdf"
                onChange={handleCambioArchivo}
              />
            </div>
            <div className="modal-footer d-flex justify-content-center">
              <form onSubmit={handleEnvio} encType="multipart/form-data">
                <div className="botonSubirArchivo">
                  <button className="btn btn-primary" type="submit">Subir</button>
                </div>
              </form>
              <p>{mensaje}</p>
            </div>
          </div>
        </div>
      )}

      {modalConfirmArchiSubido && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmación de Archivo Subido</h5>
              </div>
              <div className="modal-body">
                <p>El archivo se ha subido exitosamente.</p>
              </div>
              <div className="modal-footer d-flex justify-content-center">
                <button className="btn btn-primary" onClick={handleOK}>Ok</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
