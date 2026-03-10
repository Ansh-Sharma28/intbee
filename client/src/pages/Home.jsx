import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Home() {
  const navigate = useNavigate();
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-slate-950 text-white">

      <h1
        className="text-7xl font-extrabold leading-tight pb-2 text-transparent bg-clip-text transition-all duration-100"
        style={{
          backgroundImage: `radial-gradient(circle at ${pos.x}% ${pos.y}%, violet, #a855f7 40%, #8b5cf6 70%)`
        }}
      >
        IntBee
      </h1>

      <p className="text-xl text-slate-400 max-w-2xl mb-12">
        The ultimate battleground for calculus warriors.
        Speed. Precision. Dominance.
      </p>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div
          onClick={() => navigate("/countdown")}
          className="cursor-pointer bg-slate-800 hover:bg-indigo-600 p-8 rounded-2xl transition transform hover:scale-105"
        >
          <h2 className="text-3xl font-bold mb-4">Countdown Mode</h2>
          <p className="text-slate-300">
            Race against time. Every correct answer adds seconds.
          </p>
        </div>

        <div
          onClick={() => navigate("/vs")}
          className="cursor-pointer bg-slate-800 hover:bg-purple-600 p-8 rounded-2xl transition transform hover:scale-105"
        >
          <h2 className="text-3xl font-bold mb-4">1v1 VS Mode</h2>
          <p className="text-slate-300">
            Real-time duel. First to solve wins the round.
          </p>
        </div>
      </div>

    </div>
  );
}

export default Home;