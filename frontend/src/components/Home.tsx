import React from "react";
import "../Home.css";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const nav = useNavigate();

  const navigateToPage = (path: string) => {
    nav(path);
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Video Call App</h1>
      <div className="home-buttons">
        <button
          className="home-button make-call"
          onClick={() => navigateToPage("/sender")}
        >
          Make a Call
        </button>
        <button
          className="home-button receive-call"
          onClick={() => navigateToPage("/receiver")}
        >
          Receive a Call
        </button>
      </div>
    </div>
  );
};

export default Home;
