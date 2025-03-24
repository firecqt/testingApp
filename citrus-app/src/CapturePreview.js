import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CameraPreview.css';

const CapturePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const capturedImage = location.state?.capturedImage;

  const handleSave = () => {
    // Passing both captured image and the flag to the LibraryPage
    console.log("Navigating with captured image and isFromCamera flag...");
    navigate('/library', { 
      state: { 
        imageUrl: capturedImage, 
        isFromCamera: true // Flag indicating this image is from the camera
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
