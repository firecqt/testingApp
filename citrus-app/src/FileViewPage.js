<<<<<<< HEAD
// FileViewPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const FileViewPage = () => {
  const navigate = useNavigate();
  const fileName = 'saved_image_name'; // You should set this dynamically after saving the image
  const filePath = `/images/${fileName}.png`; // Assuming you saved it in a public/images folder

  const handleFileClick = () => {
    navigate('/otherView', { state: { fileName, filePath } });
  };

  return (
    <div>
      <h2 onClick={handleFileClick}>{fileName}</h2>
      {/* The rest of your FileViewPage content */}
=======
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
>>>>>>> c45733dd313000f3fe3d64cd95a2146ae1487ff8
    </div>
  );
};

export default FileViewPage;
