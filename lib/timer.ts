import { useState, useEffect } from "react";

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export default function useTimer(
  deadline?: string | number | Date,
  interval: number = SECOND
) {
  const [timeLeft, setTimeLeft] = useState<number>();
  const [timeLimit, setTimeLimit] = useState<number>();
  const [start, setStart] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft((_timeLeft) => _timeLeft && _timeLeft - interval);
    }, interval);

    // when paused
    if (!start) {
      return clearInterval(intervalId);
    }

    // when timer is complete and less than interval
    if (timeLeft && timeLeft <= interval) {
      return clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [interval, start, timeLeft]);

  useEffect(() => {
    if (!deadline) {
      return;
    }
    setTimeLeft(new Date(deadline).valueOf() - Date.now().valueOf());
    setTimeLimit(new Date(deadline).valueOf() - Date.now().valueOf());
    setStart(false);
  }, [deadline]);

  return {
    days: timeLeft && Math.floor(timeLeft / DAY),
    hours: timeLeft && Math.floor((timeLeft / HOUR) % 24),
    minutes: timeLeft && Math.floor((timeLeft / MINUTE) % 60),
    seconds: timeLeft && Math.floor((timeLeft / SECOND) % 60),
    timeElapsed: timeLeft && timeLimit && timeLimit - timeLeft,
    timeElapsedAsPercent:
      timeLeft && timeLimit && (timeLimit - timeLeft) / timeLimit,
    start: () => setStart(true),
    pause: () => setStart(false),
    isRunning: start,
    timeLimit,
  };
}
