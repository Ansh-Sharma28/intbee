// pages/RapidFireTest.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCircleCheck, faCircleXmark, faKeyboard, faBolt } from "@fortawesome/free-solid-svg-icons";
import useGameTimer from "../hooks/useGameTimer";
import QuestionCard from "../components/QuestionCard";
import { modes } from "../data/modes";

function RapidFireTest() {
  const navigate = useNavigate();
  const { difficulty } = useParams();

  const mode = modes.find((m) => m.level.toLowerCase() === difficulty.toLowerCase()) || modes[0];
  const maxTime = parseInt(mode.startTime.replace("s start", ""));

  const [gameStarted, setGameStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [index, setIndex] = useState(0);
  const [streak, setStreak] = useState(0);

  const { time, animating, addTime, subtractTime } = useGameTimer(maxTime, gameStarted);

  /* Fetch questions */
  useEffect(() => {
    async function loadQuestions() {
      try {
        const cap = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/questions/all/${cap}`);
        const data = await res.json();
        setQuestions(data);
      } catch (err) {
        console.error("Failed loading questions", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [difficulty]);

  const q = questions[index] || null;
  /* Lock scroll on overlay */
  useEffect(() => {
    document.body.style.overflow = !gameStarted ? "hidden" : "auto";
  }, [gameStarted]);

  /* Handle answer */
  function choose(i) {
    if (!gameStarted || time === 0) return;
    setSelected(i);
    const correct = q.options[i] === q.correctAnswer;
    let entry;

    if (correct) {
      const add = mode.tags.find((t) => t.label.includes("+"))?.label.match(/\+(\d+)s/)?.[1] || "0";
      addTime(parseInt(add));
      setStreak((s) => s + 1);
      const streakBonus = mode.tags.find((t) => t.label.includes("streak"))?.label.match(/\+(\d+)s/)?.[1];
      if (streakBonus && streak + 1 >= 3) addTime(parseInt(streakBonus));
      entry = { type: "correct", value: `+${add}s` };
    } else {
      const sub = mode.tags.find((t) => t.label.includes("−"))?.label.match(/−(\d+)s/)?.[1] || "0";
      subtractTime(parseInt(sub));
      setStreak(0);
      entry = { type: "wrong", value: `-${sub}s` };
    }

    setTimeout(() => {
      setHistory((h) => [entry, ...h].slice(0, 50));
      setSelected(null);
      setIndex((prev) => prev + 1);
    }, 250);
  }

  /* Keyboard */
  useEffect(() => {
    function handleKey(e) {
      if (!gameStarted || time === 0) return;
      if (["a", "b", "c", "d"].includes(e.key))
        choose(["a", "b", "c", "d"].indexOf(e.key));
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameStarted, time, q, streak]);

  /* End game */
  useEffect(() => {
    if (gameStarted && time === 0) {
      navigate("/rapidresults", {
        state: { history, timeLeft: 0, totalAnswered: history.length },
      });
    }
  }, [time, gameStarted]);

  /* Clock */
  function formatClock(t) {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const digits = formatClock(time).split("");
  const isFinalSeconds = time <= 10;
  const correct = history.filter((h) => h.type === "correct").length;
  const wrong = history.filter((h) => h.type === "wrong").length;

  const rules = [
    { icon: faClock, text: "Solve integrals before time runs out" },
    { icon: faCircleCheck, text: "Correct answers add time to the clock" },
    { icon: faCircleXmark, text: "Wrong answers deduct time" },
    { icon: faKeyboard, text: "Keyboard shortcuts: A  B  C  D" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">

      {/* ── OVERLAY ───────────────────────────────────────────────── */}
      {(!gameStarted || loading) && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">

          <div
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: `var(--color-${mode.color}-glow)` }}
          />

          <div className="relative w-full max-w-sm flex flex-col gap-6 animate-slideIn">

            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold tracking-widest uppercase cm-${mode.color}-label`}>
                {mode.level}
              </span>
              <span className={`text-xs border px-2.5 py-0.5 rounded-full cm-${mode.color}-badge`}>
                {mode.startTime}
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-extrabold">{mode.title}</h1>
              <p className={`text-sm mt-1 italic cm-${mode.color}-label opacity-70`}>{mode.subtitle}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {mode.tags.map((tag) => (
                <span key={tag.label} className={`text-xs border px-2 py-0.5 rounded-full cm-${tag.style}-badge`}>
                  {tag.label}
                </span>
              ))}
            </div>

            <div className="border-t border-slate-800" />

            <ul className="flex flex-col gap-3">
              {rules.map((rule) => (
                <li key={rule.text} className="flex items-center gap-3 text-sm text-slate-400">
                  <FontAwesomeIcon icon={rule.icon} className={`text-xs w-4 shrink-0 cm-${mode.color}-label`} />
                  {rule.text}
                </li>
              ))}
            </ul>

            {loading ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:300ms]" />
                <span>Loading questions...</span>
              </div>
            ) : (
              <button
                onClick={() => setGameStarted(true)}
                className={`w-full py-3 rounded-xl font-semibold text-white
                  cm-${mode.color}-button bg-gradient-to-r
                  hover:scale-105 active:scale-95 shadow-lg
                  transition-all duration-300`}
              >
                Start Round →
              </button>
            )}

          </div>
        </div>
      )}

      {/* ── LEFT GAME AREA ────────────────────────────────────────── */}
      <div className="flex-1 px-4 sm:px-8 md:px-12 py-8 md:py-10 flex flex-col items-center md:items-start">

        {/* CLOCK + streak */}
        <div className="w-full flex items-center justify-between mb-8">
          <div className="text-5xl font-extrabold tracking-wider flex">
            {digits.map((d, i) =>
              d === ":" ? (
                <span key={i} className={`mx-1 ${time > 0 && isFinalSeconds ? "blink text-rose-400" : "text-slate-600"}`}>
                  :
                </span>
              ) : (
                <span
                  key={i}
                  className={`digit-flip mx-0.5
                    ${isFinalSeconds && animating ? "animating" : ""}
                    ${time > 0 && time <= 10 ? "digit-panic" : ""}`}
                >
                  {d}
                </span>
              )
            )}
          </div>

          {streak >= 2 && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full">
              <FontAwesomeIcon icon={faBolt} className="text-[10px]" />
              {streak} streak
            </div>
          )}
        </div>

        {q && (
          <QuestionCard
            key={q._id}
            question={{
              text: q.integrand,
              options: q.options,
            }}
            // Pass this so the button turns Green/Red when clicked
            correctAnswer={q.correctAnswer}
            onChoose={choose}
            selected={selected}
            disabled={!gameStarted || time === 0}
          />
        )}
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────────── */}
      <div className="md:w-52 border-t md:border-t-0 md:border-l border-slate-800/60 p-5 md:p-6 flex flex-col gap-5">

        {/* Score summary */}
        <div className="flex md:flex-col gap-3">
          <div className="flex-1 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{correct}</p>
            <p className="text-xs text-slate-500 mt-0.5">correct</p>
          </div>
          <div className="flex-1 bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-rose-400">{wrong}</p>
            <p className="text-xs text-slate-500 mt-0.5">wrong</p>
          </div>
        </div>

        <div className="border-t border-slate-800/60" />

        {/* Recent history */}
        <div>
          <h3 className="text-xs text-slate-500 mb-3 uppercase tracking-widest">Recent</h3>
          <div className="flex flex-col gap-1.5">
            {history.slice(0, 8).map((h, i) => (
              <div
                key={i}
                className={`flex justify-between items-center text-xs px-2.5 py-1.5 rounded-lg
                  ${h.type === "correct"
                    ? "bg-emerald-500/8 text-emerald-400"
                    : "bg-rose-500/8 text-rose-400"
                  }`}
              >
                <FontAwesomeIcon
                  icon={h.type === "correct" ? faCircleCheck : faCircleXmark}
                  className="text-[10px]"
                />
                <span className="font-mono font-semibold">{h.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

export default RapidFireTest;