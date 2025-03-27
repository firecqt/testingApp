import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { scanDocument, checkApiHealth } from './services/api';
import './ViewUploadedFile.css'; 

const ViewUploadedFile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fileName, filePath } = location.state || {};
  const [fileType, setFileType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [outputFileName, setOutputFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    // Check if backend API is available
    const checkApi = async () => {
      try {
        console.log("Checking API health...");
        const status = await checkApiHealth();
        setApiStatus(status);
        console.log('API status:', status);
      } catch (err) {
        console.error('API check failed:', err);
        setApiStatus({ status: 'error', message: 'Cannot connect to API server' });
      }
    };
    
    checkApi();
    
    // Determine file type
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

  const handleScanClick = () => {
    if (apiStatus?.status !== 'ok') {
      setError('Backend API server is not available. Please start the server first.');
      setShowModal(true);
      return;
    }
    
    setShowModal(true);
    const baseName = fileName.split('.')[0];
    setOutputFileName(`${baseName}_scanned.jpg`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(null);
  };

  const handleScanDocument = async () => {
    if (!outputFileName.trim()) {
      setError('Please enter a name for the output file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log("Starting document scan process...");
      
      // Get the image file
      console.log(`Fetching image from: ${filePath}`);
      let imageFile;
      
      try {
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log(`Image fetched, size: ${blob.size} bytes, type: ${blob.type || 'unknown'}`);
        
        // Use a specific MIME type if none is detected
        const type = blob.type || (filePath.endsWith('.png') ? 'image/png' : 'image/jpeg');
        imageFile = new File([blob], fileName, { type });
      } catch (fetchError) {
        console.error('Error fetching image:', fetchError);
        throw new Error(`Could not access the image file: ${fetchError.message}`);
      }
      
      console.log(`Created File object: ${imageFile.name}, ${imageFile.size} bytes, ${imageFile.type}`);
      
      // Call the API service
      const result = await scanDocument(imageFile, outputFileName);
      
      setShowModal(false);
      setIsProcessing(false);
      
      // Navigate to view the result
      if (result.success) {
        // Make sure we're using the correct path to the file
        // Try all possible URLs in this order of preference
        let fileUrl;
        
        // First try files directory (processed directory)
        fileUrl = `http://localhost:5001/files/${result.filename}`;
        
        console.log(`Scan successful, navigating to: ${fileUrl}`);
        navigate('/view-pdf', { 
          state: { 
            fileName: result.filename, 
            filePath: fileUrl,
            scanResult: result,
            fromScan: true
          } 
        });
      }
    } catch (error) {
      console.error('Error scanning document:', error);
      setError(`Failed to scan document: ${error.message}`);
      setIsProcessing(false);
    }
  };

  if (!filePath) {
    return <div>No file selected.</div>;
  }

  return (
    <div className="view-uploaded-file">
      {/* Back Button */}
      <button className="back-button2" onClick={() => navigate('/library')}>
        Back
      </button>
      
      <h1>{fileName}</h1>

      {fileType === 'image' ? (
        <div className="image-container">
          <img src={filePath} alt={fileName} style={{ width: '100%', maxWidth: '600px' }} />
          
          {/* Scan Button for Images */}
          <button className="scan-button" onClick={handleScanClick}>
            Scan Document
          </button>
          
          {apiStatus && apiStatus.status !== 'ok' && (
            <div className="api-status-warning">
              ⚠️ Backend API not available. Please start the server.
            </div>
          )}
        </div>
      ) : fileType === 'pdf' ? (
        <embed src={filePath} type="application/pdf" width="100%" height="600px" />
      ) : (
        <p>Unsupported file type</p>
      )}

      {/* Modal for Output Name Input */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Scan Document</h3>
            
            {apiStatus && apiStatus.status !== 'ok' ? (
              <div className="error-message">
                <p>Backend API server is not available.</p>
                <p>Please start the server with:</p>
                <pre>cd backend && python app.py</pre>
              </div>
            ) : (
              <>
                <p>Please enter a name for the output file:</p>
                
                <input 
                  type="text" 
                  value={outputFileName} 
                  onChange={(e) => setOutputFileName(e.target.value)} 
                  placeholder="output_name.jpg"
                />
                
                {error && <p className="error-message">{error}</p>}
                
                <div className="modal-buttons">
                  <button 
                    onClick={handleScanDocument} 
                    disabled={isProcessing || !apiStatus || apiStatus.status !== 'ok'}
                  >
                    {isProcessing ? 'Processing...' : 'Scan Document'}
                  </button>
                  <button onClick={handleCloseModal} disabled={isProcessing}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewUploadedFile;