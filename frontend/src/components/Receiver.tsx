import React, { useEffect } from "react";
import "../Receiver.css";

const Receiver: React.FC = () => {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "receiver" }));
    };

    const pc = new RTCPeerConnection();

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createOffer") {
        pc.setRemoteDescription(message.sdp)
          .then(() => pc.createAnswer())
          .then((answer) => pc.setLocalDescription(answer))
          .then(() => {
            socket.send(
              JSON.stringify({
                type: "createAnswer",
                sdp: pc.localDescription,
              })
            );
          })
          .catch(console.error);
      } else if (message.type === "iceCandidate") {
        pc.addIceCandidate(message.candidate).catch(console.error);
      }
    };

    pc.ontrack = (event) => {
      const videoElement = document.getElementById(
        "remoteVideo"
      ) as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = event.streams[0];
      }
    };

    return () => {
      socket.close();
      pc.close();
    };
  }, []);

  return (
    <div className="receiver-container">
      <h1 className="receiver-title">Video Call - Receiver</h1>
      <video
        id="remoteVideo"
        className="receiver-video"
        autoPlay
        playsInline
      ></video>
    </div>
  );
};

export default Receiver;
