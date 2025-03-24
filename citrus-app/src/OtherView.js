// OtherView.js
import React from 'react';
import { useLocation } from 'react-router-dom';

const OtherView = () => {
  const location = useLocation();
  const { fileName, filePath } = location.state || {};

  return (
    <div className="other-view-page">
      <h1>{fileName}</h1>
      {filePath && (
        <img
          src={filePath}
          alt={fileName}
          style={{
            width: '100%',
            height: 'auto',
            marginTop: '20px',
          }}
        />
      )}
    </div>
  );
};

export default OtherView;
