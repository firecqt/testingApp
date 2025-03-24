import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LibraryPage.css';

const LibraryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const loadStoredFiles = () => {
    const storedFiles = localStorage.getItem('libraryFiles');
    if (storedFiles) {
      return JSON.parse(storedFiles);
    } else {
      const defaultFile = { name: 'fakefile.png', path: './images/fakefile.png' };
      const files = [defaultFile];
      localStorage.setItem('libraryFiles', JSON.stringify(files));
      return files;
    }
  };

  const [files, setFiles] = useState(loadStoredFiles());
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState(files);
  const [showModal, setShowModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileSource, setFileSource] = useState(null); // Track whether file is from camera or file explorer

  useEffect(() => {
    if (location.state?.imageUrl) {
      setSelectedFile(location.state.imageUrl);
      setFileSource('camera'); // Mark it as camera-uploaded file
      setNewFileName(''); // Allow renaming by setting the name to empty string
      setShowModal(true);
    }
  }, [location.state]);

  useEffect(() => {
    setFilteredFiles(files);
  }, [files]);

  const handleSaveFile = () => {
    const finalFileName = newFileName || (fileSource === 'explorer' && selectedFile?.name);
    if (finalFileName && selectedFile) {
      const newFile = { 
        name: finalFileName, 
        path: selectedFile, // Keep the original path
        isFromCamera: fileSource === 'camera' 
      };
      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      localStorage.setItem('libraryFiles', JSON.stringify(updatedFiles));
      setShowModal(false);
      setSelectedFile(null);
      setFileSource(null);
      navigate('/library', { replace: true, state: {} });
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredFiles(files.filter(file => file.name.toLowerCase().includes(query)));
  };

  const handleFileClick = (file) => {
    if (file.name === 'fakefile.png') {
      navigate('/view-pdf', { state: { fileName: file.name, filePath: file.path } });
    } else { 
      if (file.isFromCamera) {
        navigate('/view', { state: { fileName: file.name, filePath: file.path } });
      } else {
        navigate('/view-uploaded', { state: { fileName: file.name, filePath: file.path } });
      }
    }
  };

  const handleDownloadClick = (e, filePath, fileName) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file); // Create object URL for the file
      setSelectedFile(fileURL);
      setFileSource('explorer'); // Mark it as file explorer-uploaded
      setNewFileName(file.name); // Automatically set the file name for input
      setShowModal(true); // Trigger the name input modal
    }
  };

  return (
    <div className="library-page">
      <button className="back-button" onClick={() => navigate("/MainScreen")}>Back</button>

      {/* File Upload via File Explorer */}
      <input 
        type="file" 
        onChange={handleFileUpload} 
        style={{ display: 'none' }} 
        id="fileInput" 
      />
      <button className="upload-button" onClick={() => document.getElementById('fileInput').click()}>Upload File</button>

      {/* Search Bar */}
      <div className="search-bar">
        <input type="text" placeholder="Search files..." value={searchQuery} onChange={handleSearchChange} />
      </div>

      {/* File Display */}
      <div className="library-content">
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <div key={file.name} className="file-item">
              <span role="button" onClick={() => handleFileClick(file)}>📄 {file.name}</span>
              <a href="#" onClick={(e) => handleDownloadClick(e, file.path, file.name)} className="download-button">Download</a>
            </div>
          ))
        ) : (
          <p>No files found</p>
        )}
      </div>

      {/* Modal for New File Name */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Enter file name</h3>
            {/* Allow renaming for camera uploads */}
            <input 
              type="text" 
              value={newFileName} 
              onChange={fileSource === 'camera' ? (e) => setNewFileName(e.target.value) : null} 
              disabled={fileSource === 'explorer'} // Disable input for file explorer uploads
            />
            <button onClick={handleSaveFile}>Save</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
