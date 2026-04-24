/*
 * useNetworkStatus
 * ----------------
 * Hook que detecta si el dispositivo tiene conexión a internet.
 * Hace un ping liviano cada 5 segundos — no requiere módulos nativos extra.
 */

import { useEffect, useRef, useState } from "react";

const PING_URL = "https://clients3.google.com/generate_204";
const INTERVAL_MS = 5000;
const TIMEOUT_MS = 4000;

interface NetworkStatus {
  isConnected: boolean;
  isChecking: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(PING_URL, {
          method: "HEAD",
          cache: "no-cache",
          signal: controller.signal,
        });
        setIsConnected(res.ok || res.status === 204);
      } catch {
        setIsConnected(false);
      } finally {
        clearTimeout(timeout);
      }
    };

    check();
    timerRef.current = setInterval(check, INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    isConnected: isConnected ?? true,
    isChecking: isConnected === null,
  };
}
