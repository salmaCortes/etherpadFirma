import { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import './css/firmar.css';

export const Firmar = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const firmaInputRef = useRef<HTMLInputElement | null>(null);
    const contextoRef = useRef<CanvasRenderingContext2D | null>(null);

    const [documentos, setDocumentos] = useState<any[]>([]);
    const [selectedDocumento, setSelectedDocumento] = useState<any | null>(null);
    const [modalValores, setModalValores] = useState({
        carpeta: '',
        documento: '',
        documentoId: ''
    });

    let painting = false;

    useEffect(() => {
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

        const iniciarDibujo = (e: MouseEvent) => {
            painting = true;
            dibujar(e);
        };

        const finalizarDibujo = () => {
            painting = false;
            contextoRef.current!.beginPath();
        };

        const dibujar = (e: MouseEvent) => {
            if (!painting) return;

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

            firmaInput.value = canvas.toDataURL();
        };

        canvas.addEventListener('mousedown', iniciarDibujo);
        canvas.addEventListener('mousemove', dibujar);
        canvas.addEventListener('mouseup', finalizarDibujo);

        return () => {
            canvas.removeEventListener('mousedown', iniciarDibujo);
            canvas.removeEventListener('mousemove', dibujar);
            canvas.removeEventListener('mouseup', finalizarDibujo);
        };
    }, []);

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

    const cargardocumentos = async () => {
        try {
            const response = await axios.get('http://localhost:2001/firmar');
            setDocumentos(response.data);
            console.log('Datos recibidos:', response.data);
        } catch (error) {
            console.error('Error al cargar los documentos', error);
        }
    };

    useEffect(() => {
        cargardocumentos();
    }, []);

    const handleDocumentoClick = (documento: any) => {
        setSelectedDocumento(selectedDocumento === documento ? null : documento);
    };

    const clickbotonFirmar = () => {
        if (selectedDocumento) {
            console.log("Id del documento que se pasó al modal de firmas : ", selectedDocumento.id);
            setModalValores({
                carpeta: selectedDocumento.carpeta,
                documento: selectedDocumento.documento,
                documentoId: selectedDocumento.id
            });
        } else {
            console.error('Error: No hay documento seleccionado o el ID del documento no es válido');
        }
    };

    const guardarFirma = async () => {
        const firma = (firmaInputRef.current?.value || '') as string;
        const identificador = (document.querySelector('input[name="identificador"]') as HTMLInputElement)?.value || '';
        const { carpeta, documento, documentoId } = modalValores;

        const formData = new FormData();
        formData.append('firma', firma); 
        formData.append('identificador', identificador);
        formData.append('carpeta', carpeta);
        formData.append('documento', documento);
        formData.append('documentoId', documentoId);

        try {
            console.log('Enviando datos:', formData);
            {/*
                const response = await axios.post('http://localhost:2001/subirArchivoFirmado', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                 });
                
                
                */}
            await axios.post('http://localhost:2001/subirArchivoFirmado', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
           
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <div>
                <h2>Documentos</h2>
                <ul className='listaDoc'>
                    {documentos.map((documento, index) => (
                        <li
                            key={index}
                            className={selectedDocumento === documento ? 'selected' : ''}
                            onClick={() => handleDocumentoClick(documento)}
                        >
                            {documento.documento}
                        </li>
                    ))}
                </ul>
            </div>

            <button onClick={clickbotonFirmar}>Firmar</button>

            <div className='container mt-5 p-5'>
                <div className="modal-body">
                    <form method="POST" onSubmit={(e) => { e.preventDefault(); guardarFirma(); }}>
                        <h5>Coloca el identificador que contiene el contrato.</h5>
                        <p className="fw-medium text-muted fs-6">El nombre del identificador debe ir dentro de corchetes "[ ]"</p>
                        <input type="text" name="identificador" placeholder="Ejemplo: [Firma del cliente]" style={{ width: '100%' }} />
                        <div className="canvas-container">
                            <canvas ref={canvasRef} className="canvas canvas-design" id="canvas" width="300" height="250"></canvas>
                        </div>
                        <br />
                        <input ref={firmaInputRef} type="hidden" name="firma" id="firma" />
                        <input type="hidden" name="carpeta" value={modalValores.carpeta} />
                        <input type="hidden" name="documento" value={modalValores.documento} />
                        <input type="hidden" name="documentoId" value={modalValores.documentoId} />
                        <br />
                        <div className="d-grid gap-1 justify-content-end d-flex justify-content-center ">
                            <button className="btn btn-primary" type="button" onClick={limpiarFirma}>Limpiar</button>
                            <button className="btn btn-secondary" type="submit">Guardar Firma</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
