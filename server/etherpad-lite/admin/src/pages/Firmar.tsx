import { useRef, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './css/firmar.css';
import ReactDOM from 'react-dom/client'  


export const Firmar = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const firmaInputRef = useRef<HTMLInputElement | null>(null);
    const contextoRef = useRef<CanvasRenderingContext2D | null>(null);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [documentos, setDocumentos] = useState<any[]>([]);
    const [selectedDocumento, setSelectedDocumento] = useState<any | null>(null);
    const [modalValores, setModalValores] = useState({
        carpeta: '',
        documento: '',
        documentoId: ''
    });
    const [identificador, setIdentificador] = useState<string>('');
    const [modalConfirmArchiFirm, setModalConfirmArchiFirm] = useState<boolean>(false);

    let painting = false;

    const iniciarDibujo = useCallback((e: MouseEvent) => {
        painting = true;
        dibujar(e);
    }, []);

    const finalizarDibujo = useCallback(() => {
        painting = false;
        contextoRef.current!.beginPath();
    }, []);

    const dibujar = useCallback((e: MouseEvent) => {
        if (!painting) return;

        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const contexto = contextoRef.current!;
        contexto.lineWidth = 2;
        contexto.lineCap = 'round';
        contexto.strokeStyle = '#000';

        contexto.lineTo(x, y);
        contexto.stroke();
        contexto.beginPath();
        contexto.moveTo(x, y);

        firmaInputRef.current!.value = canvas.toDataURL();
    }, [painting]);

    useEffect(() => {
        if (!modalVisible) return;

        const canvas = canvasRef.current;
        const firmaInput = firmaInputRef.current;

        if (!canvas || !firmaInput) {
            console.error('Canvas or firmaInput is null');
            return;
        }

        const contexto = canvas.getContext('2d');
        if (!contexto) {
            console.error('Contexto no disponible');
            return;
        }
        contextoRef.current = contexto;

        canvas.addEventListener('mousedown', iniciarDibujo);
        canvas.addEventListener('mousemove', dibujar);
        canvas.addEventListener('mouseup', finalizarDibujo);

        return () => {
            canvas.removeEventListener('mousedown', iniciarDibujo);
            canvas.removeEventListener('mousemove', dibujar);
            canvas.removeEventListener('mouseup', finalizarDibujo);
        };
    }, [modalVisible, iniciarDibujo, dibujar, finalizarDibujo]);

    const limpiarFirma = () => {
        const canvas = canvasRef.current;
        const firmaInput = firmaInputRef.current;
        const contexto = contextoRef.current;

        if (!canvas || !firmaInput || !contexto) {
            console.error('Canvas, firmaInput or contexto is null');
            return;
        }

        contexto.clearRect(0, 0, canvas.width, canvas.height);
        firmaInput.value = '';
    };

    const cargarDocumentos = async () => {
        try {
            const response = await axios.get('http://localhost:2001/firmar');
            setDocumentos(response.data);
            console.log('Datos recibidos:', response.data);
        } catch (error) {
            console.error('Error al cargar los documentos', error);
        }
    };

    useEffect(() => {
        cargarDocumentos();
    }, []);

    const handleDocumentoClick = (documento: any) => {
        const isSelected = selectedDocumento === documento;

        if (isSelected) {
            setSelectedDocumento(null);
            setModalVisible(false);
        } else {
            setSelectedDocumento(documento);
            console.log("Id del documento que se seleccionó : ", documento.id);
            setModalValores({
                carpeta: documento.carpeta,
                documento: documento.documento,
                documentoId: documento.id
            });
            setModalVisible(true);
        }
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setSelectedDocumento(null);
    };

    const guardarFirma = async () => {
        const firma = (firmaInputRef.current?.value || '') as string;
        const { carpeta, documento, documentoId } = modalValores;

        const formData = new FormData();
        formData.append('firma', firma);
        formData.append('identificador', identificador);
        formData.append('carpeta', carpeta);
        formData.append('documento', documento);
        formData.append('documentoId', documentoId);

        try {
            console.log('Enviando datos:', formData);
            const response = await axios.post('http://localhost:2001/subirArchivoFirmado', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.status === 200) {
                setSelectedDocumento(null);
                setModalVisible(false);
                setModalConfirmArchiFirm(true);
            } else {
                console.error('Error en la respuesta del servidor', response);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleOK = () => {
        setModalConfirmArchiFirm(false);
        //window.location.reload();
        cargarDocumentos();
    };

    return (
        <div>
            <div id='documentos'>
                {documentos.length > 0 && (
                    <h2>Seleccione el documento a firmar</h2>
                )}
                <ul className="listaDoc">
                    {documentos.map((documento, index) => (
                        <li
                            key={index}
                            className={selectedDocumento === documento ? 'selected' : ''}
                            onClick={() => handleDocumentoClick(documento)}
                        >
                            <span>{documento.documento}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {modalVisible && (
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Modal de firmas</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={cerrarModal}></button>
                        </div>
                        <div className="modal-body">
                            <form method="POST" onSubmit={(e) => { e.preventDefault(); guardarFirma(); }}>
                                <h5>Coloca el identificador que contiene el contrato.</h5>
                                <p className="fw-medium text-muted fs-6">El nombre del identificador debe ir dentro de corchetes "[ ]"</p>
                                <input
                                    type="text"
                                    name="identificador"
                                    placeholder="Ejemplo: [Firma del cliente]"
                                    style={{ width: '100%' }}
                                    value={identificador}
                                    onChange={(e) => setIdentificador(e.target.value)}
                                />
                                <div className="canvas-container">
                                    <canvas ref={canvasRef} className="canvas canvas-design" id="canvas" width="300" height="250"></canvas>
                                </div>
                                <br />
                                    <input ref={firmaInputRef} type="hidden" name="firma" id="firma" />
                                    <input type="hidden" name="carpeta" value={modalValores.carpeta} />
                                    <input type="hidden" name="documento" value={modalValores.documento} />
                                    <input type="hidden" name="documentoId" value={modalValores.documentoId} />
                                <br />
                            </form>
                        </div>
                        <div className="modal-footer d-flex justify-content-center">
                            <button className="btn btn-primary" type="button" onClick={limpiarFirma}>Limpiar</button>
                            <button className="btn btn-secondary" type="button" onClick={guardarFirma}>Guardar Firma</button>
                        </div>
                    </div>
                </div>
            )}
            {modalConfirmArchiFirm && (
                <div className="modal-overlay">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirmación de Archivo Firmado</h5>
                            </div>
                            <div className="modal-body">
                                <p>El archivo se ha firmado exitosamente.</p>
                            </div>
                            <div className="modal-footer d-flex justify-content-center">
                                <button className="btn btn-primary" onClick={handleOK}>Ok</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

document.addEventListener('DOMContentLoaded', () => {
    
    const firmarDiv = document.getElementById('compoFirmar');

    if ( firmarDiv) {
        
        const root = ReactDOM.createRoot(firmarDiv);
        root.render(
            
            <Firmar />
            
        );
      
    }
});