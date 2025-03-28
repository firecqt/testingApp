import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ViewUploadedFile = () => {
  const location = useLocation();
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
      <h1>View Uploaded File</h1>
      <p>Viewing file: {fileName}</p>

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
