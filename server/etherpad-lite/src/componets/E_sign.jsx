import React, { useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const E_sign = () => {
  const [penColor, setPenColor] = useState('black');
  const [signature, setSignature] = useState(null);
  const [result, setResult] = useState(null);

  const handlerClear = () => {
    if (signature) {
      signature.clear();
      setResult(null);
    }
  };

  const handlerSave = () => {
    if (signature) {
      const res = signature.getTrimmedCanvas().toDataURL('image/jpeg');
      setResult(res);
    }
  };

  return (
    <div>
      <select value={penColor} onChange={(e) => setPenColor(e.target.value)}>
        <option value="red">Red</option>
        <option value="green">Green</option>
        <option value="black">Black</option>
      </select>

      <div style={{ height: '20px', width: '20px', borderRadius: '50%', background: penColor }}></div>

      <div style={{ width: 500, height: 200, border: `1px solid ${penColor}` }}>
        <SignatureCanvas
          penColor={penColor}
          ref={(ref) => setSignature(ref)}
          canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
          backgroundColor="rgba(255, 255, 255, 1)"
        />
      </div>

      <button onClick={handlerClear}>Clear</button>
      <button onClick={handlerSave}>Save</button>

      {result && (
        <div>
          <img src={result} alt="Signature" />
          <a href={result} download>
            Download
          </a>
        </div>
      )}
    </div>
  );
};

export default E_sign;
