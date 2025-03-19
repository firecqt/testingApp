import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LibraryPage.css';

const LibraryPage = () => {
  const navigate = useNavigate();
 
  const files = [
    { name: 'fakefile.pdf', path: '/path/to/fakefile.pdf' },
    { name: 'document1.pdf', path: '/path/to/document1.pdf' },
    { name: 'imagefile.png', path: '/path/to/imagefile.png' },
    { name: 'report.docx', path: '/path/to/report.docx' },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState(files);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filtered = files.filter((file) =>
      file.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredFiles(filtered);
  };

  const handleFileClick = (fileName) => {
    navigate('/view-pdf', { state: { fileName } }); 
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

  return (
    <div className="library-page">
      <div className="library-header">
        <button className="back-button" onClick={() => navigate("/MainScreen")}>
          Back
        </button>
      </div>

      {}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="library-content">
        {}
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <div key={file.name} className="file-item" onClick={() => handleFileClick(file.name)}>
              <span role="img" aria-label="file">📄</span> {file.name}
              <a
                href="#"
                onClick={(e) => handleDownloadClick(e, file.path, file.name)}
                style={{
                  marginLeft: '10px',
                  padding: '3px 8px',
                  backgroundColor: '#808080',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  position: 'absolute',
                  right: '550px',
                }}
              >
                Download
              </a>
            </div>
          ))
        ) : (
          <p>No files found</p>
        )}
      </div>
    </div>
  );
};

export default LibraryPage;
