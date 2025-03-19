import React, { useRef, useState, useEffect } from 'react';

const CameraCapture = () => {
  const videoRef = useRef(null); 
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing the camera: ", err);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imgUrl = canvas.toDataURL('image/png');
    setImage(imgUrl);
  };

  return (
    <div>
      <h1>Capture an Image from the Camera</h1>
      <video ref={videoRef} width="640" height="480" autoPlay></video>
      <button onClick={captureImage}>Capture</button>
      <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }}></canvas>
      {image && (
        <div>
          <h2>Captured Image:</h2>
          <img src={image} alt="Captured" />
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
