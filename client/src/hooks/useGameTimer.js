import { useState, useEffect } from "react";

export default function useGameTimer(initialTime) {

  const [time, setTime] = useState(initialTime);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {

    if (time <= 0) return;

    const interval = setInterval(() => {

      setAnimating(true);

      setTimeout(() => {
        setTime(t => t - 1);
        setAnimating(false);
      }, 200);

    }, 1000);

    return () => clearInterval(interval);

  }, [time]);

  const addTime = (value) => setTime(t => t + value);

  const subtractTime = (value) =>
    setTime(t => Math.max(0, t - value));

  return { time, animating, addTime, subtractTime };

}