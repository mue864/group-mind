import { useEffect, useRef } from "react";

/**
 * useInterval - A custom React hook to run a callback at a specified interval (like setInterval, but React-safe)
 *
 * @param callback - The function you want to run on each interval
 * @param delay - The delay in milliseconds. Pass null to pause the interval
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(null);

  // Save the latest version of the callback function
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) return;

    const tick = () => {
      // Always call the most recent callback
      if (savedCallback.current) savedCallback.current();
    };

    const id = setInterval(tick, delay);

    // Cleanup the interval when component unmounts or delay changes
    return () => clearInterval(id);
  }, [delay]);
}
