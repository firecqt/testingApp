import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ViewPage.css';

const ViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fileName, filePath } = location.state || {};

  const [mode, setMode] = useState("none");
  const [isTextMode, setIsTextMode] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [drawing, setDrawing] = useState(false);
  const canvasRef = useRef(null);
  const textInputRef = useRef(null);

  useEffect(() => {
    if (isTextMode && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [isTextMode]);

  const handleMouseDown = (e) => {
    if (mode === "text") {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setTextPosition({ x, y });
      setIsTextMode(true); // Enable text mode when clicking on the canvas
    } else if (mode === "crayon" || mode === "highlighter") {
      setDrawing(true);
      draw(e, true);
    }
  };

  const handleMouseUp = () => {
    setDrawing(false);
  };

  const handleMouseMove = (e) => {
    if (drawing && (mode === "crayon" || mode === "highlighter")) {
      draw(e, false);
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

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
  };

  const handleTextSubmit = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.font = "20px Arial";
    context.fillStyle = "black";
    context.fillText(textInput, textPosition.x, textPosition.y); // Draw text at the position
    setTextInput(""); // Reset input field
    setIsTextMode(false); // Exit text mode
  };

  if (!filePath) {
    return <div>No file selected.</div>;
  }

  return (
    <div className="file-view-page">
      <button className="back-button" onClick={() => navigate('/library')}>Back</button>

      {/* File Display */}
      <div className="file-display">
        {filePath.endsWith('.pdf') ? (
          <iframe src={filePath} width="100%" height="500px" title={fileName}></iframe>
        ) : (
          <div className="canvas-container">
            <img src={filePath} alt={fileName} className="cropped-image" />
            <canvas
              ref={canvasRef}
              width={800}
              height={650}
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                zIndex: 1,
                cursor: mode === "text" ? "text" : "crosshair",
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
                  onBlur={handleTextSubmit} // Submit text when input field loses focus
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
        )}
      </div>

      {/* Editing Tools (Only for Images) */}
      {!filePath.endsWith('.pdf') && (
        <div className="tools">
          <button onClick={() => setMode("crayon")}>Crayon</button>
          <button onClick={() => setMode("highlighter")}>Highlighter</button>
          <button onClick={() => setMode("none")}>None</button>
        </div>
      )}
    </div>
  );
};

export default ViewPage;
