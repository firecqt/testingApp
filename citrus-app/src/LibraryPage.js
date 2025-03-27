import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LibraryPage.css';

const LibraryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { imageUrl, isFromCamera, scanResult } = location.state || {};

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
  const [newFileName, setNewFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileSource, setFileSource] = useState(null);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentFolder, setCurrentFolder] = useState('Root');
  const [isCameraFile, setIsCameraFile] = useState(false);
  const [modalShown, setModalShown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add or update files without duplicates
  const addOrUpdateFiles = (newFiles) => {
    const updatedFiles = [...files];
    let hasChanges = false;

    newFiles.forEach(newFile => {
      // Check if file with this name already exists
      const existingIndex = updatedFiles.findIndex(f => f.name === newFile.name);
      
      if (existingIndex === -1) {
        // File doesn't exist, add it
        updatedFiles.push(newFile);
        hasChanges = true;
      } else if (newFile.path !== updatedFiles[existingIndex].path) {
        // File exists but path is different, update it
        updatedFiles[existingIndex] = {
          ...updatedFiles[existingIndex],
          path: newFile.path,
          isScanned: newFile.isScanned
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setFiles(updatedFiles);
      localStorage.setItem('libraryFiles', JSON.stringify(updatedFiles));
      return true;
    }
    return false;
  };

  // Add function to fetch storage files
  const fetchStorageFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/debug-files');
      if (!response.ok) {
        throw new Error('Failed to fetch storage files');
      }
      const data = await response.json();
      
      // Process storage files
      const storageFiles = data.storage_files || [];
      const processedFiles = data.processed_files || [];
      
      // Combine the lists (removing duplicates by filename)
      const apiFiles = [...storageFiles, ...processedFiles];
      const uniqueApiFiles = [];
      const fileNames = new Set();
      
      apiFiles.forEach(file => {
        if (!fileNames.has(file.filename)) {
          fileNames.add(file.filename);
          uniqueApiFiles.push(file);
        }
      });
      
      // Convert to your file format
      const newApiFiles = uniqueApiFiles.map(file => ({
        name: file.filename,
        path: `http://localhost:5001/storage/${file.filename}`,
        folder: 'Root',
        isFromStorage: true,
        isScanned: true
      }));
      
      // Add files without creating duplicates
      const filesAdded = addOrUpdateFiles(newApiFiles);
      
      if (filesAdded) {
        console.log('Added/updated files from storage');
      } else {
        console.log('No new files from storage');
      }
    } catch (error) {
      console.error('Error fetching storage files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Handle files from the camera
    if (isFromCamera && imageUrl && !modalShown) {
      setSelectedFile(imageUrl);
      setIsCameraFile(true);
      setShowModal(true);
      setModalShown(true);
    }
    
    // Filter files based on current folder
    setFilteredFiles(files.filter(file => file.folder === currentFolder));
  }, [files, currentFolder, imageUrl, isFromCamera, modalShown]);

  // Separate useEffect for API calls and scan results
  useEffect(() => {
    // Fetch storage files when component mounts
    fetchStorageFiles();
    
    // Check if we've just returned from scanning a file
    if (scanResult && scanResult.success) {
      // Add the scanned file to the library without creating duplicates
      const newFile = {
        name: scanResult.filename,
        path: `http://localhost:5001${scanResult.storage_url || scanResult.direct_url || scanResult.pdf_url}`,
        folder: 'Root',
        isScanned: true
      };
      
      addOrUpdateFiles([newFile]);
      
      // Clear the scan result from location state to prevent re-adding on refreshes
      window.history.replaceState({}, document.title);
    }
  }, [scanResult]);

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
      } else if (file.isScanned) {
        navigate('/view-pdf', { state: { fileName: file.name, filePath: file.path } });
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
      setNewFileName(file.name);
      setShowModal(true);
    }
  };

  const toggleDropdown = (file) => {
    setCurrentFile(file);
    setMoveModalVisible(true);
  };

  const handleMoveFile = (folder) => {
    const updatedFiles = files.map(file => file === currentFile ? { ...file, folder: folder.name } : file);
    setFiles(updatedFiles);
    localStorage.setItem('libraryFiles', JSON.stringify(updatedFiles));
    setMoveModalVisible(false);
  };

  const handleDeleteFile = (fileToDelete) => {
    const updatedFiles = files.filter(file => file !== fileToDelete);
    setFiles(updatedFiles);
    localStorage.setItem('libraryFiles', JSON.stringify(updatedFiles));
  };

  const handleFolderClick = (folderName) => {
    setCurrentFolder(folderName);
  };

  const handleSaveFile = () => {
    const finalFileName = newFileName || (fileSource === 'explorer' && selectedFile?.name);
    if (finalFileName && selectedFile) {
      const newFile = { 
        name: finalFileName, 
        path: selectedFile, 
        folder: 'Root', 
        isFromCamera: fileSource === 'camera' 
      };
      
      addOrUpdateFiles([newFile]);
      
      setShowModal(false);
      setSelectedFile(null);
      setFileSource(null);
      navigate('/library', { replace: true, state: {} });
    }
  };

  const handleCreateFolder = () => {
    setShowModal('folder');  // Trigger folder creation modal
  };

  const toggleActionMenu = (fileId, e) => {
    e.stopPropagation(); // Prevent triggering file click
    if (activeDropdown === fileId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(fileId);
    }
  };

  const handleRefreshFiles = () => {
    fetchStorageFiles();
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="library-page">
      <div className="library-toolbar">
        <div className="toolbar-left">
          <button className="back-button" onClick={() => navigate("/MainScreen")}>
            Back
          </button>
        </div>
        <div className="toolbar-right">
          <input 
            type="file" 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
            id="fileInput" 
          />
          <button 
            className="upload-button" 
            onClick={() => document.getElementById('fileInput').click()}
          >
            Upload File
          </button>
          <button 
            className="create-folder-button" 
            onClick={handleCreateFolder}
          >
            + Folder
          </button>
          <button
            className="refresh-button"
            onClick={handleRefreshFiles}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : '↻'}
          </button>
        </div>
      </div>

      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search files..." 
          value={searchQuery} 
          onChange={handleSearchChange} 
        />
      </div>

      {/* Folders Grid */}
      {folders.length > 0 && (
        <div className="grid-container">
          {folders.map((folder) => (
            <div 
              key={folder.name} 
              className="grid-item" 
              onClick={() => handleFolderClick(folder.name)}
            >
              <div className="grid-item-content">
                <div className="grid-item-icon">📁</div>
                <div className="grid-item-name">{folder.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Files Grid */}
      {filteredFiles.length > 0 ? (
        <div className="grid-container">
          {filteredFiles.map((file) => (
            <div 
              key={file.name} 
              className="grid-item"
              onClick={() => handleFileClick(file)}
            >
              <div className="grid-item-content">
                <div className="grid-item-icon">{file.isScanned ? '📄' : '📄'}</div>
                <div className="grid-item-name">{file.name}</div>
                <div className="kebab-menu" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="kebab-button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActionMenu(file.name, e);
                    }}
                  >
                    …
                  </button>
                  
                  {activeDropdown === file.name && (
                    <div className="dropdown-menu">
                      <button onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadClick(file.path, file.name);
                      }}>
                        Download
                      </button>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(file);
                      }}>
                        Move
                      </button>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file);
                      }}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        currentFolder !== 'Root' && <p className="no-files-message">No files found</p>
      )}

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

      {/* File Naming Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{showModal === 'folder' ? 'Create New Folder' : (isCameraFile ? 'Name Your File' : 'Name Your File')}</h3>
            <input 
              type="text" 
              value={showModal === 'folder' ? newFolderName : newFileName} 
              onChange={(e) => showModal === 'folder' ? setNewFolderName(e.target.value) : setNewFileName(e.target.value)} 
              placeholder={isCameraFile ? "Enter file name" : "Enter folder name"} 
            />
            <button onClick={showModal === 'folder' ? handleSaveFolder : handleSaveFile}>Save</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
