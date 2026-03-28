// src/data/modes.js
export const modes = [
  {
    level: "Easy",
    color: "emerald",
    startTime: "30s start",
    title: "Warm Up",
    subtitle: "Confidence booster.",
    tags: [
      { label: "+10s correct", style: "emerald" },
      { label: "No Penalty",   style: "slate" },
    ],
    details: ["Topics: ", "Great for building speed", "Game ends when timer hits 0"],
  },
  {
    level: "Medium",
    color: "purple",
    startTime: "45s start",
    title: "The Real Deal",
    subtitle: "Feels fair. Sometimes.",
    tags: [
      { label: "+10s correct", style: "purple" },
      { label: "−5s wrong",    style: "purple" }, 
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
      { label: "−10s wrong",   style: "red" },
      { label: "+60s streak",  style: "red" },
    ],
    details: ["Topics: ", "Partial fractions", "3 correct streak = bonus time"],
  },
];