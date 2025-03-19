import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CameraPreview.css';

const CapturePreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const capturedImage = location.state?.capturedImage;

  const handleSave = () => {
    //saves image to variable, could make global if needed, alans thing goes here 
    console.log('Image saved:', capturedImage);
    navigate('/MainScreen');
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
