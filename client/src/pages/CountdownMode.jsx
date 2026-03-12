import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function CountdownMode() {
  const navigate = useNavigate();

  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [digit, setDigit] = useState(9);
  const [animating, setAnimating] = useState(false);
  const [openCard, setOpenCard] = useState(null);

  const titleRef = useRef(null);

  /* Mouse gradient tracking + touch support */
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!titleRef.current) return;
      const rect = titleRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPos({ x, y });
    };

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

  /* Countdown animation */
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

  const titleGradient = `radial-gradient(circle at ${pos.x}% ${pos.y}%,
    violet 0%, #a855f7 8%, #8b5cf6 18%, #6366f1 40%, #6366f1b3 100%)`;

  const getDigitGradient = () => {
    if (digit >= 7) return "linear-gradient(to bottom, #818cf8, #6366f1)";
    if (digit >= 5) return "linear-gradient(to bottom, #a78bfa, #8b5cf6)";
    if (digit >= 3) return "linear-gradient(to bottom, #e879f9, #d946ef)";
    return "linear-gradient(to bottom, #fb7185, #f43f5e)";
  };

  const modes = [
    {
      level: "Easy",
      color: "emerald",
      startTime: "30s start",
      title: "Warm Up",
      subtitle: "Confidence booster.",
      tags: [
        { label: "+10s correct", style: "emerald" },
        { label: "No Penalty", style: "slate" },
      ],
      details: ["Topics: ", "Great for building speed", "Game ends when timer hits 0"],
    },
    {
      level: "Normal",
      color: "purple",
      startTime: "45s start",
      title: "The Real Deal",
      subtitle: "Feels fair. Sometimes.",
      tags: [
        { label: "+10s correct", style: "purple" },
        { label: "−5s wrong", style: "purple" },
      ],
      details: ["Topics: ", "Trig identities", "Wrong answers reduce time"],
    },
    {
      level: "Hard",
      color: "red",
      startTime: "60s start",
      title: "Emotional Damage",
      subtitle: "You asked for this.",
      tags: [
        { label: "+30s correct", style: "red" },
        { label: "−10s wrong", style: "red" },
        { label: "+60s streak", style: "red" },
      ],
      details: ["Topics: ", "Partial fractions", "3 correct streak = bonus time"],
    },
  ];

  const colorMap = {
    emerald: {
      label: "text-emerald-400",
      badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      hover: "hover:border-emerald-500/50 hover:shadow-emerald-500/10",
      sum: "hover:text-emerald-400",
    },
    purple: {
      label: "text-purple-400",
      badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      hover: "hover:border-purple-500/50 hover:shadow-purple-500/10",
      sum: "hover:text-purple-400",
    },
    red: {
      label: "text-red-400",
      badge: "bg-red-500/10 text-red-400 border-red-500/20",
      hover: "hover:border-red-500/50 hover:shadow-red-500/10",
      sum: "hover:text-red-400",
    },
    slate: {
      badge: "bg-slate-700/40 text-slate-300 border-slate-600/30",
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-24">

      {/* HEADER */}
      <div className="soft-gradient-bg w-full mb-6 sm:mb-10">
        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-tight pb-2 text-transparent bg-clip-text transition-all duration-150 opacity-0 animate-slideIn mb-4 sm:mb-6"
          style={{
            backgroundImage: titleGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {/* "Countd{digit}wn" on one line, "Mode" on the next on mobile */}
          <span className="block sm:inline">
            Countd
            <span
              className={`digit-flip mx-0.5 sm:mx-1
        ${animating ? "animating" : ""}
        ${digit <= 2 ? "digit-panic" : ""}`}
              style={{
                backgroundImage: getDigitGradient(),
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {digit}
            </span>
            wn
          </span>
          {" "}
          <span className="block sm:inline">Mode</span>
        </h1>

        <ul
          className="text-slate-500 max-w-lg text-sm sm:text-base md:text-lg space-y-1 list-disc"
          style={{ paddingLeft: "1.2rem" }}
        >
          <li>Solve integrals before time runs out.</li>
          <li>Correct answers give you more seconds.</li>
        </ul>
      </div>

      {/* MODE CARDS */}
      <div className="flex flex-col items-center w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-5xl items-start">

          {modes.map((mode) => {
            const c = colorMap[mode.color];
            const isOpen = openCard === mode.level;

            return (
              <div
                key={mode.level}
                onClick={() => console.log(mode.level)}
                className={`group bg-slate-800/60 border border-slate-700 p-5 sm:p-6 rounded-2xl cursor-pointer
                  hover:-translate-y-1 hover:bg-slate-800 hover:shadow-lg
                  active:scale-95 transition-all duration-300 ${c.hover}`}
              >
                {/* Card header */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-bold tracking-widest uppercase ${c.label}`}>
                    {mode.level}
                  </span>
                  <span className={`text-xs border px-2 py-0.5 rounded-full ${c.badge}`}>
                    {mode.startTime}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold mb-1">{mode.title}</h2>
                <p className="text-slate-400 text-sm mb-4 italic">{mode.subtitle}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {mode.tags.map((tag) => (
                    <span
                      key={tag.label}
                      className={`text-xs border px-2 py-0.5 rounded-full ${colorMap[tag.style].badge}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>

                {/* More info — smooth toggle, no shake */}
                <div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenCard(isOpen ? null : mode.level);
                    }}
                    className={`flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none transition-colors duration-200 ${c.sum}`}
                  >
                    More info
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`text-[10px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                      }`}
                  >
                    <ul className="mt-3 text-slate-400 text-xs space-y-1 border-t border-slate-700 pt-3 list-disc pl-5">
                      {mode.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            );
          })}

        </div>
      </div>

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/")}
        className="fixed bottom-6 left-4 sm:bottom-10 sm:left-10 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-600 hover:bg-slate-800 transition-all duration-200 group touch-manipulation"
        aria-label="Go back"
      >
        <FontAwesomeIcon
          icon={faArrowLeft}
          className="text-sm transition-transform duration-200 group-hover:-translate-x-0.5"
        />
      </button>

    </div>
  );
}

export default CountdownMode;