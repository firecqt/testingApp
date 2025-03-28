import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CameraScreen.css'; 

const CameraScreen = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate(); 
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.log(err));

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const capturedImage = canvas.toDataURL();
    setCapturedImage(capturedImage);

    navigate('/capture-preview', { state: { capturedImage } });
  };

  const handleCancel = () => {
    navigate('/MainScreen'); 
  };

  return (
    <div className="camera-screen">
      <div className="camera-header"></div>
      <div className="camera-view">
        <video
          ref={videoRef}
          className="camera-video"
          autoPlay
          playsInline
        />
      </div>
      <button className="capture-button" onClick={handleCapture}>
      </button>
      <button className="cancel-button" onClick={handleCancel}>
        Cancel
      </button>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default CameraScreen;
