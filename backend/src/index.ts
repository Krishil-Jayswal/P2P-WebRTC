import { WebSocketServer, WebSocket } from "ws";

let senderSocekt: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(message) {
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message.toString());
    } catch (error) {
      console.log("Error in parsing JSON data: ", error);
    }
    if (!parsedMessage) {
      return;
    }
    switch (parsedMessage.type) {
      case "sender":
        senderSocekt = ws;
        break;
      case "receiver":
        receiverSocket = ws;
        break;
      case "createOffer":
        if (ws !== senderSocekt) {
          return;
        }
        receiverSocket?.send(
          JSON.stringify({ type: "createOffer", sdp: parsedMessage.sdp })
        );
      case "createAnswer":
        if (ws !== receiverSocket) {
          return;
        }
        senderSocekt?.send(
          JSON.stringify({ type: "createAnswer", sdp: parsedMessage.sdp })
        );
      case "iceCandidate":
        if (ws === senderSocekt) {
          receiverSocket?.send(
            JSON.stringify({
              type: "iceCandidate",
              candidate: parsedMessage.candidate,
            })
          );
        } else if (ws === receiverSocket) {
          senderSocekt?.send(
            JSON.stringify({
              type: "iceCandidate",
              candidate: parsedMessage.candidate,
            })
          );
        }
    }
  });
});
