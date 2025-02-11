import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Socket from "./Scoket";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/socket" element={<Socket />} />
      </Routes>
    </Router>
  );
}

export default App;
