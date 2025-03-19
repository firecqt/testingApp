import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './FileViewPage.css';

const FileViewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fileName } = location.state; 

  return (
    <div className="file-view-page">
      <button className="back-button" onClick={() => navigate('/Library')}>
        Back to Library
      </button>
      <div className="file-content">
        <h2>Viewing {fileName}</h2>
        <p>This is where the file content will go.</p>
        { }
      </div>
    </div>
  );
};

export default FileViewPage;
