import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CountdownMode from "./pages/CountdownMode";
import VsMode from "./pages/VsMode";
import RapidFireTest from "./pages/RapidFireTest";

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/countdown" element={<CountdownMode />} />
          <Route path="/vs" element={<VsMode />} />
          <Route path="/rapid" element={<RapidFireTest />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;