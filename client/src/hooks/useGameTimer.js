import { useState, useEffect, useRef } from "react";

export default function useGameTimer(maxTime, running) {
  const [time, setTime] = useState(maxTime);
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setAnimating(true);

      setTimeout(() => {
        setTime((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return t - 1;
        });

        setAnimating(false);
      }, 120);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running]);

  function addTime(v) {
    setTime((t) => t + v);
  }

  function subtractTime(v) {
    setTime((t) => {
      const next = Math.max(0, t - v);
      if (next === 0) {
        clearInterval(intervalRef.current);
      }
      return next;
    });
  }

  return {
    time,
    animating,
    addTime,
    subtractTime,
  };
}