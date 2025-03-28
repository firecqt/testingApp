import React from 'react';
import { useLocation } from 'react-router-dom';

const ProcessedImage = () => {
  const location = useLocation();
  const { imageUrl } = location.state || {};

  if (!imageUrl) {
    return <div>No processed image found.</div>;
  }

  return (
    <div className="processed-image-container">
      <h2>Processed Image</h2>
      <div>
        <img src={imageUrl} alt="Processed" className="processed-image" />
      </div>
    </div>
  );
};

export default ProcessedImage;
