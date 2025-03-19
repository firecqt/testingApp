import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fakefileImage from './images/fakefile.png';
import './FileViewPage.css';

const PDFViewPage = () => {
  const navigate = useNavigate();
  const [drawing, setDrawing] = useState(false);
  const [mode, setMode] = useState("crayon"); 
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [textInput, setTextInput] = useState("");
  const [isTextMode, setIsTextMode] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const canvasRef = useRef(null);
  const textInputRef = useRef(null);

  useEffect(() => {
    updateCanvasSize();
  }, []);

  useEffect(() => {
    if (isTextMode && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [isTextMode]);

  const handleMouseDown = (e) => {
    if (mode === "none") return;

    if (mode === "text") {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setTextPosition({ x, y });
      setIsTextMode(true);
    } else {
      setDrawing(true);
      draw(e, true);
    }
  };

  const handleMouseUp = () => setDrawing(false);

  const handleMouseMove = (e) => {
    if (!drawing || mode === "none") return;
    draw(e, false);
  };

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
  };

  const handleTextSubmit = () => {
    if (textInput.trim() !== "") {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.font = "20px Arial";
      context.fillStyle = "black";
      context.fillText(textInput, textPosition.x, textPosition.y);
      setTextInput("");
      setIsTextMode(false);
    }
  };

  const draw = (e, isNewPath) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isNewPath) {
      context.beginPath();
      context.moveTo(x, y);
    }

    context.lineWidth = mode === "crayon" ? 5 : 10;
    context.lineCap = "round";
    context.strokeStyle = mode === "crayon" ? "#000000" : "yellow";
    context.globalAlpha = mode === "highlighter" ? 0.1 : 1;
    context.lineTo(x, y);
    context.stroke();
  };

  const updateCanvasSize = () => {
    const img = new Image();
    img.src = fakefileImage;
    img.onload = () => {
      setCanvasSize({ width: img.width, height: img.height });
    };
  };

  return (
    <div className="file-view-page">
      <button className="back-button" onClick={() => navigate('/Library')}>
        Back
      </button>
      <div className="tools">
        <button onClick={() => setMode("crayon")}>Crayon</button>
        <button onClick={() => setMode("highlighter")}>Highlighter</button>
        <button onClick={() => setMode("text")}>Text</button>
        <button onClick={() => setMode("none")}>None</button>
      </div>
      <div className="file-content">
        <img
          src={fakefileImage}
          alt="Fake File"
          style={{
            width: '100%',
            height: 'auto',
            marginTop: '20px',
          }}
        />

        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            zIndex: 1,
            cursor: "crosshair",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseOut={handleMouseUp}
        />

        {isTextMode && (
          <div
            style={{
              position: "absolute",
              top: textPosition.y + 10,
              left: textPosition.x,
              zIndex: 2,
            }}
          >
            <input
              ref={textInputRef}
              type="text"
              value={textInput}
              onChange={handleTextChange}
              onBlur={handleTextSubmit}
              style={{
                fontSize: "16px",
                padding: "5px",
                border: "1px solid black",
                color: "black", 
              }}
            />
            <button onClick={handleTextSubmit}>Add Text</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewPage;
