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
    </div>
  );
};

export default FileViewPage;
