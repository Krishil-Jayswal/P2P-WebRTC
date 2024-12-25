import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Sender from "./components/Sender";
import Receiver from "./components/Receiver";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home></Home>}></Route>
        <Route path="/sender" element={<Sender></Sender>}></Route>
        <Route path="/receiver" element={<Receiver></Receiver>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
