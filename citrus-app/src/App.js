import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './header';
import CitrusApp from "./CitrusApp";
import CameraScreen from './CameraScreen';
import MainScreen from './MainScreen';
import CapturePreview from './CapturePreview';
import LibraryPage from './LibraryPage';  
import FileViewPage from './FileViewPage'
import PDFViewPage from './PDFViewPage'; 

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
          <Route path="/capture-preview" element={<CapturePreview />} /> {}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
