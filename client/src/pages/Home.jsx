// Home.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Home() {
  const navigate = useNavigate();
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const titleRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!titleRef.current) return;
      const rect = titleRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPos({ x, y });
    };

    // Touch support for mobile
    const handleTouchMove = (e) => {
      if (!titleRef.current) return;
      const touch = e.touches[0];
      const rect = titleRef.current.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      setPos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 text-center bg-slate-950 text-white">

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 sm:w-96 sm:h-96 bg-violet-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-900/20 rounded-full blur-3xl" />
      </div>

      {/* Title */}
      <h1
        ref={titleRef}
        className="text-[clamp(48px,16vw,140px)] font-extrabold leading-none pb-2 text-transparent bg-clip-text transition-all duration-100 select-none mb-4"
        style={{
          backgroundImage: `radial-gradient(circle at ${pos.x}% ${pos.y}%, violet, #a855f7 40%, #8b5cf6 70%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        IntBee
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-xs sm:max-w-md md:max-w-2xl mb-10 sm:mb-12 px-2">
        The ultimate battleground for calculus.{" "}
        <span className="text-slate-300">Solve. Survive. Repeat.</span>
      </p>

      {/* Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-xs sm:max-w-xl md:max-w-3xl relative z-10">

        {/* Countdown */}
        <div
          onClick={() => navigate("/countdown")}
          className="group relative cursor-pointer bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden text-left active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/8 group-hover:to-transparent transition-all duration-300 rounded-2xl" />
          <div className="relative z-10">
            <span className="text-xs font-bold tracking-widest text-indigo-500/70 uppercase mb-3 block">
              Mode 01
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-slate-100 group-hover:text-indigo-300 transition-colors duration-300">
              Countdown
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Race against the clock. Every correct answer buys you more time. Wrong ones cost you.
            </p>
            <div className="flex items-center gap-2 text-indigo-500/80 text-xs font-semibold tracking-wide">
              <span>Play now</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </div>
          </div>
        </div>

        {/* 1v1 VS */}
        <div
          onClick={() => navigate("/vs")}
          className="group relative cursor-pointer bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/10 overflow-hidden text-left active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/8 group-hover:to-transparent transition-all duration-300 rounded-2xl" />
          <div className="relative z-10">
            <span className="text-xs font-bold tracking-widest text-purple-500/70 uppercase mb-3 block">
              Mode 02
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-slate-100 group-hover:text-purple-300 transition-colors duration-300">
              Versus Mode
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Real-time duel against another player. First to solve the integral wins the round.
            </p>
            <div className="flex items-center gap-2 text-purple-500/80 text-xs font-semibold tracking-wide">
              <span>Play now</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;