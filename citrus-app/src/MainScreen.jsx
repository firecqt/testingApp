import React from "react";
import { useNavigate } from "react-router-dom"; 
import uploadImage from "./images/upload.jpeg"; 
import libraryImage from "./images/library.jpeg"; 
import "./MainScreen.css"; 

const MainScreen = () => {
  const navigate = useNavigate();  

  return (
    <div className="main-screen">
      <div className="image-container" onClick={() => navigate("/camera")}>
        <img src={uploadImage} alt="Upload" className="image1" style={{ cursor: "pointer" }} />
      </div>

      <div className="image-container" onClick={() => navigate("/Library")}>
        <img src={libraryImage} alt="Library" className="image2" />
      </div>
    </div>
  );
};

export default MainScreen;
