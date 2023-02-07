import { useState, useEffect } from "react";

const SECOND = 1_000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export default function useTimer(
  deadline: string | number | Date,
  interval: number = SECOND
) {
  const [timeLeft, setTimeLeft] = useState(
    new Date(deadline).valueOf() - Date.now().valueOf()
  );
  const [timeLimit, setTimeLimit] = useState(new Date(deadline).valueOf());
  const [start, setStart] = useState(false);

  console.log(timeLeft);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((_timeLeft) => _timeLeft - interval);
    }, interval);

    if (!start) {
      return clearInterval(intervalId);
    }
    if (timeLeft <= interval) {
      setTimeLeft(0);
      return clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [interval, start, timeLeft]);

  useEffect(() => {
    setTimeLeft(new Date(deadline).valueOf() - Date.now().valueOf());
    setTimeLimit(new Date(deadline).valueOf() - Date.now().valueOf());
    setStart(false);
  }, [deadline]);

  return {
    days: Math.floor(timeLeft / DAY),
    hours: Math.floor((timeLeft / HOUR) % 24),
    minutes: Math.floor((timeLeft / MINUTE) % 60),
    seconds: Math.floor((timeLeft / SECOND) % 60),
    timeLapsedAsPercent: (timeLimit - timeLeft) / timeLimit,
    start: () => setStart(true),
    pause: () => setStart(false),
    isRunning: start,
  };
}
