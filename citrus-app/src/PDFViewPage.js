import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import fakefileImage from './images/fakefile.png'; // Only use as fallback
import './FileViewPage.css';

const PDFViewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fileName, filePath, scanResult } = location.state || {};
  const [drawing, setDrawing] = useState(false);
  const [mode, setMode] = useState("crayon"); 
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [textInput, setTextInput] = useState("");
  const [isTextMode, setIsTextMode] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading image...");
  const canvasRef = useRef(null);
  const textInputRef = useRef(null);
  const imageRef = useRef(null);

  // Try alternative URLs if the main one fails
  const tryAlternativeUrls = (originalUrl) => {
    // If the URL is already a files URL, try storage instead
    if (originalUrl.includes('/files/')) {
      return originalUrl.replace('/files/', '/storage/');
    }
    // If it's a storage URL, try files
    if (originalUrl.includes('/storage/')) {
      return originalUrl.replace('/storage/', '/files/');
    }
    
    // If it's neither, construct both alternatives
    const filename = originalUrl.split('/').pop();
    return [
      `http://localhost:5001/files/${filename}`,
      `http://localhost:5001/storage/${filename}`,
      `http://localhost:5001/get-file/processed/${filename}`,
      `http://localhost:5001/get-file/root/${filename}`
    ];
  };

  useEffect(() => {
    if (filePath) {
      // Start with the provided URL
      setLoadingMessage(`Trying to load image from: ${filePath}`);
      console.log(`Attempting to load image from: ${filePath}`);
      
      const loadImage = (url, alternativeUrls = []) => {
        const img = new Image();
        
        img.onload = () => {
          console.log(`Successfully loaded image from: ${url}`);
          setImageLoaded(true);
          setImageError(false);
          setCanvasSize({ width: img.width, height: img.height });
          // Store the successful URL
          sessionStorage.setItem('lastSuccessfulImageUrl', url);
        };
        
        img.onerror = () => {
          console.error(`Failed to load image from: ${url}`);
          
          if (alternativeUrls.length > 0) {
            // Try next alternative URL
            const nextUrl = alternativeUrls[0];
            const remainingUrls = alternativeUrls.slice(1);
            setLoadingMessage(`Trying alternative URL: ${nextUrl}`);
            loadImage(nextUrl, remainingUrls);
          } else {
            // All URLs failed
            console.error("All URLs failed to load the image");
            setImageError(true);
            setLoadingMessage("Failed to load the image from any source");
            // Fallback to default image
            updateCanvasSize();
          }
        };
        
        img.src = url;
      };
      
      // Generate alternative URLs
      const alternatives = tryAlternativeUrls(filePath);
      if (Array.isArray(alternatives)) {
        loadImage(filePath, alternatives);
      } else {
        loadImage(filePath, [alternatives]);
      }
    } else {
      updateCanvasSize();
    }
  }, [filePath]);

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
      <button className="back-button" onClick={() => navigate('/Library', { state: { scanResult } })}>
        Back
      </button>
      <div className="tools">
        <button onClick={() => setMode("crayon")}>Crayon</button>
        <button onClick={() => setMode("highlighter")}>Highlighter</button>
        <button onClick={() => setMode("text")}>Text</button>
        <button onClick={() => setMode("none")}>None</button>
      </div>
      <div className="file-content">
        <h2>{fileName || "Document"}</h2>
        
        {!imageLoaded && !imageError && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            backgroundColor: '#f0f0f0',
            borderRadius: '5px' 
          }}>
            <p>{loadingMessage}</p>
          </div>
        )}
        
        {/* Display actual image if loaded, otherwise fallback */}
        {imageLoaded ? (
          <img
            ref={imageRef}
            src={filePath}
            alt={fileName || "Document"}
            style={{
              width: '100%',
              height: 'auto',
              marginTop: '20px',
            }}
          />
        ) : imageError ? (
          <div style={{ 
            color: 'red', 
            marginTop: '20px', 
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#ffeeee',
            borderRadius: '5px'
          }}>
            <p>Error loading your scanned image. The file may not exist or might have been moved.</p>
            <p>Filename: {fileName}</p>
            <p>Path: {filePath}</p>
            <p>Try going back to the library and viewing the file again.</p>
          </div>
        ) : (
          // Fallback to default image if needed
          <img
            src={fakefileImage}
            alt="Document"
            style={{
              width: '100%',
              height: 'auto',
              marginTop: '20px',
            }}
          />
        )}

        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
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
