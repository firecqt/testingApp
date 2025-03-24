import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CameraPreview.css';

const CapturePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const capturedImage = location.state?.capturedImage;

  const handleSave = () => {
    // Navigate to the LibraryPage with the captured image URL and the isFromCamera flag
    navigate('/library', { 
      state: { 
        imageUrl: capturedImage, 
        isFromCamera: true // Mark it as from the camera
      } 
    });
  };

  const handleDiscard = () => {
    navigate('/camera');
  };

  if (!capturedImage) {
    return <div>No image captured.</div>;
  }

  return (
    <div className="capture-preview">
      <div className="preview-container">
        <img src={capturedImage} alt="Captured Preview" className="captured-image" />
      </div>
      <div className="actions">
        <button onClick={handleSave}>Save</button>
        <button onClick={handleDiscard}>Discard</button>
      </div>
    </div>
  );
};

export default CapturePreview;
