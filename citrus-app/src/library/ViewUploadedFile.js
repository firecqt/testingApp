import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ViewUploadedFile.css'; 

const ViewUploadedFile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fileName, filePath } = location.state || {}; // Retrieve fileName and filePath from location state
  const [fileType, setFileType] = useState('');

  useEffect(() => {
    if (filePath) {
      const extension = fileName.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
        setFileType('image');
      } else if (['pdf'].includes(extension)) {
        setFileType('pdf');
      } else {
        setFileType('unknown');
      }
    }
  }, [filePath, fileName]);

  return (
    <div className="view-uploaded-file">
      {/* Back Button */}
      <button className="back-button2" onClick={() => navigate('/library')}>
        Back
      </button>
      <h1></h1>

      {fileType === 'image' ? (
        <img src={filePath} alt={fileName} style={{ width: '100%', maxWidth: '600px' }} />
      ) : fileType === 'pdf' ? (
        <embed src={filePath} type="application/pdf" width="100%" height="600px" />
      ) : (
        <p>Unsupported file type</p>
      )}
    </div>
  );
};

export default ViewUploadedFile;
