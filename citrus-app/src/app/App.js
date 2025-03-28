import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './header';
import CitrusApp from "./CitrusApp";
import CameraScreen from '../components/CameraScreen';
import MainScreen from './MainScreen';
import CapturePreview from '../components/CapturePreview';
import LibraryPage from '../library/LibraryPage';  
import FileViewPage from '../library/FileViewPage'
import PDFViewPage from '../library/PDFViewPage'; 
import ProcessedImage from '../components/ProcessedImage';
import ViewPage from '../library/ViewPage';
import ViewUploadedFile from '../library/ViewUploadedFile';

function App() {
  return (
    <Router>
      <div className="mobile-container">
        <Header />
        <Routes>
          <Route path="/" element={<CitrusApp />} />
          <Route path="/MainScreen" element={<MainScreen />} />
          <Route path="/camera" element={<CameraScreen />} />
          <Route path="/Library" element={<LibraryPage />} />
          <Route path="/file-view" element={<FileViewPage />} />
          <Route path="/view-pdf" element={<PDFViewPage />} />
          <Route path="/view" element={<ViewPage />} />
          <Route path="/processed-image" element={<ProcessedImage />} />
          <Route path="/capture-preview" element={<CapturePreview />} /> 
          <Route path="/view-uploaded" element={<ViewUploadedFile />} /> {}
        </Routes>
      </div>
    </Router>
  );
}

export default App;