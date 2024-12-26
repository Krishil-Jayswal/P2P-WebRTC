import React, { useEffect, useState } from "react";
import "../Sender.css";

const Sender: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [, setPC] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    setSocket(ws);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "sender" }));
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const initiateConnection = async () => {
    if (!socket) {
      alert("Socket not found");
      return;
    }

    const peerConnection = new RTCPeerConnection();
    setPC(peerConnection);

    peerConnection.onnegotiationneeded = async () => {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.send(
          JSON.stringify({
            type: "createOffer",
            sdp: peerConnection.localDescription,
          })
        );
      } catch (error) {
        console.error("Error during negotiation:", error);
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
        );
      }
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "createAnswer") {
        peerConnection.setRemoteDescription(message.sdp).catch(console.error);
      } else if (message.type === "iceCandidate") {
        peerConnection.addIceCandidate(message.candidate).catch(console.error);
      }
    };

    await getCameraStreamAndSend(peerConnection);
  };

  const getCameraStreamAndSend = async (peerConnection: RTCPeerConnection) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const videoElement = document.getElementById(
        "localVideo"
      ) as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = stream;
      }
      stream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream));
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  return (
    <div className="sender-container">
      <h1 className="sender-title">Video Call - Sender</h1>
      <video
        id="localVideo"
        className="sender-video"
        autoPlay
        playsInline
        muted
      ></video>
      <button className="sender-button" onClick={initiateConnection}>
        Start Call
      </button>
    </div>
  );
};

export default Sender;
