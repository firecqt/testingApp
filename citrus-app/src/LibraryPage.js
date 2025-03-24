import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LibraryPage.css';

const LibraryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { imageUrl, isFromCamera } = location.state || {};

  const loadStoredFiles = () => {
    const storedFiles = localStorage.getItem('libraryFiles');
    if (storedFiles) {
      return JSON.parse(storedFiles);
    } else {
      const defaultFile = { name: 'fakefile.png', path: './images/fakefile.png', folder: 'Root' };
      const files = [defaultFile];
      localStorage.setItem('libraryFiles', JSON.stringify(files));
      return files;
    }
  };

  const loadFolders = () => {
    const storedFolders = localStorage.getItem('folders');
    if (storedFolders) {
      return JSON.parse(storedFolders);
    } else {
      const defaultFolder = { name: 'Root' };
      const folders = [defaultFolder];
      localStorage.setItem('folders', JSON.stringify(folders));
      return folders;
    }
  };

  const [files, setFiles] = useState(loadStoredFiles());
  const [folders, setFolders] = useState(loadFolders());
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState(files);
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileSource, setFileSource] = useState(null);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('Root');
  const [isCameraFile, setIsCameraFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [modalShown, setModalShown] = useState(false);  // Track if the modal has been shown already

  useEffect(() => {
    if (isFromCamera && imageUrl && !modalShown) {
      setSelectedFile(imageUrl);
      setIsCameraFile(true);
      setShowModal(true); // Show modal only if it's the first time
      setModalShown(true); // Mark modal as shown
    }
    setFilteredFiles(files.filter(file => file.folder === currentFolder));
  }, [files, currentFolder, imageUrl, isFromCamera, modalShown]);  // Add modalShown as a dependency

  const handleSaveFolder = () => {
    if (newFolderName.trim() && !folders.some(folder => folder.name === newFolderName)) {
      const newFolder = { name: newFolderName };
      const updatedFolders = [...folders, newFolder];
      setFolders(updatedFolders);
      localStorage.setItem('folders', JSON.stringify(updatedFolders));
      setNewFolderName('');
      setShowModal(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredFiles(files.filter(file => file.name.toLowerCase().includes(query) && file.folder === currentFolder));
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

  const handleDownloadClick = (filePath, fileName) => {
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
      const fileURL = URL.createObjectURL(file);
      setSelectedFile(fileURL);
      setFileSource('explorer');
      setShowModal(true);
    }
  };

  const handleCameraUpload = (file) => {
    if (file) {
      setIsCameraFile(true);
      setSelectedFile(file);
      setFileSource('camera');
      setShowModal(true);
    }
  };

  const toggleDropdown = (file) => {
    setCurrentFile(file);
    setMoveModalVisible(true);
  };

  const handleMoveFile = (folder) => {
    const updatedFiles = files.map(file => 
      file === currentFile ? { ...file, folder: folder.name } : file
    );
    setFiles(updatedFiles);
    localStorage.setItem('libraryFiles', JSON.stringify(updatedFiles));
    setMoveModalVisible(false);
  };

  const handleDeleteFile = (fileToDelete) => {
    const updatedFiles = files.filter(file => file !== fileToDelete);
    setFiles(updatedFiles);
    localStorage.setItem('libraryFiles', JSON.stringify(updatedFiles));
  };

  const handleCreateFolder = () => {
    setShowModal('folder');
  };

  const handleFolderClick = (folderName) => {
    setCurrentFolder(folderName);
  };

  const handleFileNameChange = (e) => {
    setNewFileName(e.target.value);
  };

  const handleSaveFile = () => {
    if (newFileName.trim()) {
      const newFile = { 
        name: newFileName, 
        path: selectedFile, 
        folder: currentFolder, 
        isFromCamera: isCameraFile 
      };
      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      localStorage.setItem('libraryFiles', JSON.stringify(updatedFiles));
      setNewFileName('');
      setIsCameraFile(false);
      setShowModal(false);
    }
  };

  return (
    <div className="library-page">
      <button className="back-button" onClick={() => navigate("/MainScreen")}>Back</button>

      {/* File Upload */}
      <input 
        type="file" 
        onChange={handleFileUpload} 
        style={{ display: 'none' }} 
        id="fileInput" 
      />
      <button className="upload-button" onClick={() => document.getElementById('fileInput').click()}>Upload File</button>

      {/* Create Folder */}
      <button className="create-folder-button" onClick={handleCreateFolder}>+ Folder</button>

      {/* Search Bar */}
      <div className="search-bar">
        <input type="text" placeholder="Search files..." value={searchQuery} onChange={handleSearchChange} />
      </div>

      {/* Folder Display */}
      <div className="folder-display">
        {folders.length > 0 && folders.map((folder) => (
          <div key={folder.name} className="file-item folder-item" onClick={() => handleFolderClick(folder.name)}>
            <span>📁 {folder.name}</span>
          </div>
        ))}
      </div>

      {/* File Display */}
      <div className="library-content">
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <div key={file.name} className="file-item">
              <span role="button" onClick={() => handleFileClick(file)}>📄 {file.name}</span>

              {/* Download and Delete Buttons */}
              <button onClick={() => handleDownloadClick(file.path, file.name)} className="download-button">
                Download
              </button>
              <button onClick={() => handleDeleteFile(file)} className="delete-button">
                Delete
              </button>

              {/* Move Button */}
              <button onClick={() => toggleDropdown(file)} className="move-button">
                Move
              </button>
            </div>
          ))
        ) : (
          currentFolder !== 'Root' && <p className="no-files-message">No files found</p>
        )}
      </div>

      {/* Move File Modal */}
      {moveModalVisible && (
        <div className="modal">
          <div className="modal-content">
            <h3>Move file to:</h3>
            {folders.filter(folder => folder.name !== 'Root').map((folder) => (
              <button key={folder.name} onClick={() => handleMoveFile(folder)}>{folder.name}</button>
            ))}
            <button onClick={() => handleMoveFile({ name: 'Root' })}>Move to Root</button>
            <button onClick={() => setMoveModalVisible(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Modal for New Folder Name */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{isCameraFile ? 'Name your Camera File' : 'Create New Folder'}</h3>
            {isCameraFile && (
              <input 
                type="text" 
                value={newFileName} 
                onChange={handleFileNameChange} 
                placeholder="Enter file name"
              />
            )}
            {!isCameraFile && (
              <input 
                type="text" 
                value={newFolderName} 
                onChange={(e) => setNewFolderName(e.target.value)} 
                placeholder="Enter folder name"
              />
            )}
            <button onClick={isCameraFile ? handleSaveFile : handleSaveFolder}>Save</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
