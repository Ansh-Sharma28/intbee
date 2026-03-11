import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

function CountdownMode() {

  const navigate = useNavigate();

  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [digit, setDigit] = useState(9);
  const [animating, setAnimating] = useState(false);

  const titleRef = useRef(null);

  const [openCard, setOpenCard] = useState(null);

  /* Mouse gradient tracking */

  useEffect(() => {

    const handleMouseMove = (e) => {

      if (!titleRef.current) return;

      const rect = titleRef.current.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setPos({ x, y });

    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);

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


  const titleGradient =
    `radial-gradient(circle at ${pos.x}% ${pos.y}%,
      violet 0%,
      #a855f7 8%,
      #8b5cf6 18%,
      #6366f1 40%,
      #6366f1b3 100%)`;


  /* Urgency gradient */

  const getDigitGradient = () => {

    if (digit >= 7)
      return "linear-gradient(to bottom,#818cf8,#6366f1)";

    if (digit >= 4)
      return "linear-gradient(to bottom,#a78bfa,#8b5cf6)";

    if (digit >= 3)
      return "linear-gradient(to bottom,#e879f9,#d946ef)";

    return "linear-gradient(to bottom,#fb7185,#f43f5e)";

  };


  return (

    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* HEADER */}

      <div className="soft-gradient-bg w-full mb-10">

        <h1
          ref={titleRef}
          className="text-8xl font-extrabold leading-tight pb-2 text-transparent bg-clip-text transition-all duration-150 opacity-0 animate-slideIn mb-6"
          style={{ backgroundImage: titleGradient }}
        >

          Countd

          <span
            className={`digit-flip mx-1
${animating ? "animating" : ""}
${digit <= 2 ? "digit-panic" : ""}`}
            style={{
              backgroundImage: getDigitGradient(),
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >

            {digit}

          </span>

          wn Mode

        </h1>

        <ul
          className="text-slate-500 max-w-lg text-lg space-y-1 list-disc"
          style={{  paddingLeft: "1.2rem" }}
        >
          <li>Solve integrals before time runs out.</li>
          <li>Correct answers give you more seconds.</li>
        </ul>

      </div>


      {/* MODE CARDS */}

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
            <p className="text-slate-400 text-sm mb-4 italic">
              Confidence booster.
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                +10s correct
              </span>

              <span className="text-xs bg-slate-700/40 text-slate-300 border border-slate-600/30 px-2 py-0.5 rounded-full">
                No Penalty
              </span>
            </div>

            <details>
              <summary
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-emerald-400 cursor-pointer select-none"
              >
                More info
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-[10px] transition-transform duration-300"
                />
              </summary>

              <div className="details-content">
                <ul className="mt-3 text-slate-400 text-xs space-y-1 border-t border-slate-700 pt-3 list-disc pl-5">
                  <li>Topics: </li>
                  <li>Great for building speed</li>
                  <li>Game ends when timer hits 0</li>
                </ul>
              </div>
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
            <p className="text-slate-400 text-sm mb-4 italic">
              Feels fair. Sometimes.
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                +10s correct
              </span>

              <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                −5s wrong
              </span>
            </div>

            <details>
              <summary
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-purple-400 cursor-pointer select-none"
              >
                More info
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-[10px] transition-transform duration-300"
                />
              </summary>

              <div className="details-content">
                <ul className="mt-3 text-slate-400 text-xs space-y-1 border-t border-slate-700 pt-3 list-disc pl-5">
                  <li>Topics: </li>
                  <li>Trig identities</li>
                  <li>Wrong answers reduce time</li>
                </ul>
              </div>
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

            <h2 className="text-2xl font-extrabold mb-1">
              Emotional Damage
            </h2>
            <p className="text-slate-400 text-sm mb-4 italic">
              You asked for this.
            </p>

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

            <details>
              <summary
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-red-400 cursor-pointer select-none"
              >
                More info
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-[10px] transition-transform duration-300"
                />
              </summary>

              <div className="details-content">
                <ul className="mt-3 text-slate-400 text-xs space-y-1 border-t border-slate-700 pt-3 list-disc pl-5">
                  <li>Topics: </li>
                  <li>Partial fractions</li>
                  <li>3 correct streak = bonus time</li>
                </ul>
              </div>
            </details>
          </div>

        </div>
      </div>


      {/* BACK BUTTON */}

      <button
        onClick={() => navigate("/")}
        className="fixed bottom-10 left-10 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:border-slate-600 hover:bg-slate-800 transition-all duration-200 group"
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