import { WebSocketServer, WebSocket } from "ws";

let senderSocekt: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;
const messageQueue: any[] = [];

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws) {
  ws.on("error", console.error);

  ws.on("message", function message(message) {
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message.toString());
      console.log("Messsage parsed successfully.");
    } catch (error) {
      console.log("Error in parsing JSON data: ", error);
    }
    if (!parsedMessage) {
      return;
    }
    switch (parsedMessage.type) {
      case "sender":
        senderSocekt = ws;
        console.log("Sender connected successfully.");
        break;
      case "receiver":
        receiverSocket = ws;
        console.log("Receiver connected successfully.");
        console.log("Started processing the message queue.");
        while (messageQueue.length) {
          ws.send(JSON.stringify(messageQueue.shift()));
        }
        console.log("Message queue processed successfully.");
        break;
      case "createOffer":
        if (ws !== senderSocekt) {
          return;
        }
        if (!receiverSocket) {
          messageQueue.push(parsedMessage);
          console.log("Offer pushed in queue.");
          return;
        }
        receiverSocket.send(
          JSON.stringify({ type: "createOffer", sdp: parsedMessage.sdp })
        );
        console.log("Offer sent to receiver successfully.");
        break;
      case "createAnswer":
        if (ws !== receiverSocket) {
          return;
        }
        senderSocekt?.send(
          JSON.stringify({ type: "createAnswer", sdp: parsedMessage.sdp })
        );
        console.log("Answer sent to sender successfully.");
        break;
      case "iceCandidate":
        if (ws === senderSocekt) {
          if (!receiverSocket) {
            messageQueue.push(parsedMessage);
            console.log("Candidate from sender pushed in queue.");
            return;
          }
          receiverSocket.send(
            JSON.stringify({
              type: "iceCandidate",
              candidate: parsedMessage.candidate,
            })
          );
          console.log("Candidate from sender -> receiver.");
        } else if (ws === receiverSocket) {
          senderSocekt?.send(
            JSON.stringify({
              type: "iceCandidate",
              candidate: parsedMessage.candidate,
            })
          );
          console.log("Candidate from receiver -> sender.");
        }
        break;
    }
  });

  ws.on("close", () => {
    if (ws === senderSocekt) {
      senderSocekt = null;
      console.log("Sender disconnected.");
    }
    if (ws === receiverSocket) {
      receiverSocket = null;
      console.log("Receiver disconnected.");
    }
  });
});

console.log("Signaling server started successfully on port 8080.");
