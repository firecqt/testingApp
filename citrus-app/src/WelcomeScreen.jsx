import React from "react";
import './WelcomeScreen.css';  

function WelcomeScreen() {
  return (
    <div className="welcome-screen">
      <h1 className="main-heading">Welcome to Citrus!</h1>
      <p className="emoji-text">🍊🍋🍈🍋🍊</p>
      <p className="description">Scan, organize, and edit your documents effortlessly</p>
      <p className="emoji-text">📒📓📝📓📒</p>
      <p className="cta">tap to get started</p>
    </div>
  );
}

export default WelcomeScreen;
