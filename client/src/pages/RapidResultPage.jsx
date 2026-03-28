import { useLocation } from "react-router-dom";

export default function RapidResultPage() {
  const location = useLocation();
  const timeLeft = location.state?.timeLeft ?? 0;

  return (
    <div>
      <h1>Results</h1>
      <p>Time left: {timeLeft}</p>
    </div>
  );
}