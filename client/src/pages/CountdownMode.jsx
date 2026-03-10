import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function CountdownMode() {
  const navigate = useNavigate();

  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [digit, setDigit] = useState(9);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);

      setTimeout(() => {
        setDigit((d) => (d === 0 ? 9 : d - 1));
        setAnimating(false);
      }, 300);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const gradient = `radial-gradient(circle at ${pos.x}% ${pos.y}%, violet 0%, #a855f7 8%, #8b5cf6 18%, #6366f1 40%, #3b82f6 70%, #3b82f6 100%)`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col px-10 py-12">

      {/* Title */}
      <h1
        className="text-8xl font-extrabold leading-tight pb-2 text-transparent bg-clip-text transition-all duration-100 opacity-0 animate-slideIn"
        style={{ backgroundImage: gradient }}
      >
        Countd
        <span
          className={`digit-flip mx-1 ${animating ? "animating" : ""}`}
          style={{
            backgroundImage: "linear-gradient(to bottom, #f0abfc, #a855f7)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          {digit}
        </span>
        wn Mode
      </h1>

      <ul className="text-slate-400 mb-12 max-w-lg text-2xl list-disc list-inside">
        <li>Solve integrals before time runs out.</li>
        <li>Correct answers give you more seconds.</li>
      </ul>

      {/* Mode Cards */}
      <div className="flex flex-col items-center w-full">
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl items-start">

          {/* EASY */}
          <div
            onClick={() => console.log("Easy")}
            className="group bg-slate-800/60 border border-slate-700 p-6 rounded-2xl cursor-pointer h-fit hover:-translate-y-1 hover:border-emerald-500/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
                Easy
              </span>

              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                30s start
              </span>
            </div>

            <h2 className="text-2xl font-extrabold mb-1">Warm Up</h2>
            <p className="text-slate-400 text-sm mb-4 italic">Confidence booster.</p>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                +10s correct
              </span>

              <span className="text-xs bg-slate-700/40 text-slate-300 border border-slate-600/30 px-2 py-0.5 rounded-full">
                No Penalty
              </span>
            </div>

            <details className="group/details">
              <summary
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-emerald-400 cursor-pointer select-none"
              >
                More info
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-[10px] transition-transform group-open/details:rotate-180"
                />
              </summary>

              <ul className="mt-3 text-slate-400 text-xs space-y-1 border-t border-slate-700 pt-3 list-disc pl-5">
                <li>Topics: ∫xⁿ, ∫eˣ, basic u-substitution</li>
                <li>Great for building speed</li>
                <li>Game ends when timer hits 0</li>
              </ul>
            </details>
          </div>

          {/* NORMAL */}
          <div
            onClick={() => console.log("Normal")}
            className="group bg-slate-800/60 border border-slate-700 p-6 rounded-2xl cursor-pointer h-fit hover:-translate-y-1 hover:border-purple-500/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-widest text-purple-400 uppercase">
                Normal
              </span>

              <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                45s start
              </span>
            </div>

            <h2 className="text-2xl font-extrabold mb-1">The Real Deal</h2>
            <p className="text-slate-400 text-sm mb-4 italic">Feels fair. Sometimes.</p>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                +10s correct
              </span>

              <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                −5s wrong
              </span>
            </div>

            <details className="group/details">
              <summary
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-purple-400 cursor-pointer select-none"
              >
                More info
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-[10px] transition-transform group-open/details:rotate-180"
                />
              </summary>

              <ul className="mt-3 text-slate-400 text-xs space-y-1 border-t border-slate-700 pt-3 list-disc pl-5">
                <li>Topics: integration by parts, trig identities</li>
                <li>Wrong answers reduce time</li>
                <li>Game ends when timer hits 0</li>
              </ul>
            </details>
          </div>

          {/* HARD */}
          <div
            onClick={() => console.log("Hard")}
            className="group bg-slate-800/60 border border-slate-700 p-6 rounded-2xl cursor-pointer h-fit hover:-translate-y-1 hover:border-red-500/50 hover:bg-slate-800 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-widest text-red-400 uppercase">
                Hard
              </span>

              <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                60s start
              </span>
            </div>

            <h2 className="text-2xl font-extrabold mb-1">Emotional Damage</h2>
            <p className="text-slate-400 text-sm mb-4 italic">You asked for this.</p>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                +30s correct
              </span>

              <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                −10s wrong
              </span>

              <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                +60s streak
              </span>
            </div>

            <details className="group/details">
              <summary
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 cursor-pointer select-none"
              >
                More info
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-[10px] transition-transform group-open/details:rotate-180"
                />
              </summary>

              <ul className="mt-3 text-slate-400 text-xs space-y-1 border-t border-slate-700 pt-3 list-disc pl-5">
                <li>Trig substitution & partial fractions</li>
                <li>3 correct = bonus time</li>
                <li>Game ends when timer hits 0</li>
              </ul>
            </details>
          </div>

        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="mt-12 flex items-center gap-2 text-slate-500 hover:text-white transition-colors w-fit"
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Back
      </button>

    </div>
  );
}

export default CountdownMode;