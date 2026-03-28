import React from "react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css"; 

export default function QuestionCard({
  question,
  onChoose,
  selected,
  disabled = false,
  correctAnswer = null
}) {
  const letters = ["A", "B", "C", "D"];

  return (
    <div className="w-full max-w-lg bg-slate-900/80 border border-slate-700/50 p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
      
      {/* Integrand Display */}
      <div className="mb-10 py-8 px-4 bg-slate-800/40 rounded-2xl border border-slate-800/60 flex justify-center items-center">
        <div className="text-3xl text-white overflow-x-auto no-scrollbar">
          <BlockMath math={question.text || ""} />
        </div>
      </div>

      {/* Options List */}
      <div className="flex flex-col gap-4">
        {question.options?.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = opt === correctAnswer;
          
          let stateClasses = "border-slate-700 bg-slate-800/40 text-slate-300 hover:border-purple-500/50 hover:bg-slate-800";
          
          if (isSelected) {
            stateClasses = isCorrect 
              ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-500/20" 
              : "border-rose-500 bg-rose-500/20 text-rose-300 ring-2 ring-rose-500/20";
          }

          const interactiveClasses = disabled
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer active:scale-[0.98]";

          return (
            <button
              key={i}
              onClick={() => !disabled && onChoose(i)}
              disabled={disabled}
              className={`flex items-center p-5 rounded-2xl border transition-all duration-150 ${stateClasses} ${interactiveClasses}`}
            >
              <span className={`mr-5 font-black text-sm tracking-widest ${isSelected ? "opacity-100" : "opacity-40"}`}>
                {letters[i]}
              </span>
              <div className="flex-1 text-left overflow-x-auto no-scrollbar">
                <InlineMath math={opt} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}