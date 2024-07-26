import  { useRef, useEffect } from 'react';

import './css/firmar.css'

export const Firmar = () => {
    // Asegúrate de especificar los tipos correctos para las referencias
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const firmaInputRef = useRef<HTMLInputElement | null>(null);
    const contextoRef = useRef<CanvasRenderingContext2D | null>(null);
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
            contexto.beginPath();
        };

        const dibujar = (e: MouseEvent) => {
            if (!painting) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            contexto.lineWidth = 2;
            contexto.lineCap = 'round';
            contexto.strokeStyle = '#000';

            contexto.lineTo(x, y);
            contexto.stroke();
            contexto.beginPath();
            contexto.moveTo(x, y);

            if (firmaInput) {
                firmaInput.value = canvas.toDataURL();
            }
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

    return (
        <div>
            <div className='container mt-5 p-5'>
                <div className="modal-body">
                    <form method="POST" onSubmit={(e) => { e.preventDefault(); }}>
                        <h5>Coloca el identificador que contiene el contrato.</h5>
                        <p className="fw-medium text-muted fs-6">El nombre del identificador debe ir dentro de corchetes "[ ]"</p>
                        <input type="text" name="identificador" placeholder="Ejemplo: [Firma del cliente]" style={{ width: '100%' }} />
                        <div className="canvas-container">
                            <canvas className="canvas canvas-design" ref={canvasRef} width="300" height="250"></canvas>
                        </div>
                        <br />
                        <input type="hidden" name="firma" ref={firmaInputRef} />
                        <input type="hidden" name="carpeta" value="carpeta" />
                        <input type="hidden" name="documento" value="documento" />
                        <input type="hidden" name="documentoId" value="id" />
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
