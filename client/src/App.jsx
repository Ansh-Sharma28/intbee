import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CountdownMode from "./pages/CountdownMode";
import VsMode from "./pages/VsMode";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/countdown" element={<CountdownMode />} />
          <Route path="/vs" element={<VsMode />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;