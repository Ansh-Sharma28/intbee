import { useState, useEffect } from "react";
import useGameTimer from "../hooks/useGameTimer";

function RapidFireTest() {
  const maxTime = 60;
  const { time, animating, addTime, subtractTime } = useGameTimer(maxTime);

  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  const questions = [
    {
      img: "/questions/q1.png",
      correct: 0,
    },
  ];

  const q = questions[0];

  function formatClock(t) {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const clock = formatClock(time);
  const digits = clock.split("");
  const isFinalSeconds = time <= 10;

  function choose(i) {
    setSelected(i);
    const correct = i === q.correct;
    let entry;

    if (correct) {
      addTime(3);
      entry = { type: "correct", value: "+3s" };
    } else {
      subtractTime(2);
      entry = { type: "wrong", value: "-2s" };
    }

    setTimeout(() => {
      setHistory((h) => [entry, ...h].slice(0, 5));
      setSelected(null);
    }, 250);
  }

  /* keyboard input */
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "a") choose(0);
      if (e.key === "b") choose(1);
      if (e.key === "c") choose(2);
      if (e.key === "d") choose(3);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">

      {/* LEFT GAME AREA */}
      <div className="flex-1 px-4 sm:px-8 md:px-12 py-6 sm:py-8 md:py-10 flex flex-col items-center md:items-start">

        {/* CLOCK */}
        <div className="text-4xl sm:text-5xl font-extrabold tracking-wider mb-6 sm:mb-10 flex justify-center w-full">
          {digits.map((d, i) => {
            if (d === ":") {
              return (
                <span
                  key={i}
                  className={`mx-1 ${isFinalSeconds ? "blink text-rose-400" : "text-slate-500"}`}
                >
                  :
                </span>
              );
            }
            return (
              <span
                key={i}
                className={`digit-flip mx-1
                  ${isFinalSeconds && animating ? "animating" : ""}
                  ${time <= 10 ? "digit-panic" : ""}`}
              >
                {d}
              </span>
            );
          })}
        </div>

        {/* QUESTION IMAGE */}
        <div className="mb-8 sm:mb-12 md:mb-16 w-full flex justify-center md:justify-start">
          <img
            src={q.img}
            alt="question"
            className="max-h-48 sm:max-h-60 md:max-h-72 w-auto max-w-full object-contain"
          />
        </div>

        {/* OPTIONS (A B C D) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full max-w-xs sm:max-w-sm">
          {["A", "B", "C", "D"].map((letter, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              className={`flex items-center justify-center
                h-16 sm:h-20 text-2xl sm:text-3xl font-bold rounded-xl border
                transition-all duration-200 active:scale-95 touch-manipulation
                ${selected === i
                  ? "border-purple-500 bg-purple-500/10 text-purple-300"
                  : "border-slate-800 bg-slate-900 hover:border-purple-500/40 hover:bg-slate-800"
                }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — horizontal strip on mobile, sidebar on md+ */}
      <div className="
        flex flex-row md:flex-col
        md:w-64
        border-t md:border-t-0 md:border-l border-slate-800
        p-4 sm:p-6 md:p-8
        gap-3 md:gap-0
        overflow-x-auto md:overflow-x-visible
      ">
        <h3 className="text-sm text-slate-500 md:mb-6 uppercase tracking-wider shrink-0 self-center md:self-auto">
          Recent
        </h3>

        <div className="flex flex-row md:flex-col gap-2 md:gap-3">
          {history.map((h, i) => (
            <div
              key={i}
              className={`flex justify-between text-sm px-3 py-2 rounded-lg shrink-0
                ${h.type === "correct"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-rose-500/10 text-rose-400"
                }`}
            >
              <span>{h.type === "correct" ? "✓" : "✗"}</span>
              <span className="ml-2">{h.value}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default RapidFireTest;