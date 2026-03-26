import { useEffect, useRef } from 'react';

/**
 * useGameLoop: setInterval-based game tick.
 * Returns a ref to allow externally clearing/restarting.
 */
export function useGameLoop(tickCallback, speed, active) {
  const callbackRef = useRef(tickCallback);

  // Always keep ref current so the interval always calls the latest version
  useEffect(() => {
    callbackRef.current = tickCallback;
  }, [tickCallback]);

  useEffect(() => {
    if (!active) return;

    const id = setInterval(() => {
      callbackRef.current();
    }, speed);

    return () => clearInterval(id);
  }, [speed, active]);
}
