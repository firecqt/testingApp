import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeScreen from "./WelcomeScreen";
import MainScreen from "./MainScreen";

export default function CitrusApp() {
  const [showWelcome, setShowWelcome] = useState(true);
  const navigate = useNavigate();

  return (
    <div
      className="w-screen h-screen flex items-center justify-center"
      onClick={() => setShowWelcome(false)}
    >
      {showWelcome ? <WelcomeScreen /> : <MainScreen navigate={navigate} />}
    </div>
  );
}
