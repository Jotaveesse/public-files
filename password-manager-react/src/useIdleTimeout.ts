// useIdleTimeout.ts
import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = [
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "wheel",
    "scroll",
] as const;

export function useIdleTimeout(
    onIdle: () => void,
    onUpdate:(timeLeft:number)=> void,
    timeoutMs = 5 * 60 * 1000,
    enabled = true,
) {
    const lastActivity = useRef(Date.now());
    const onIdleRef = useRef(onIdle);

    // always call the latest callback without re-registering listeners
    useEffect(() => {
        onIdleRef.current = onIdle;
    });

    useEffect(() => {
        if (!enabled) return;
        lastActivity.current = Date.now();

        const markActive = () => {
            lastActivity.current = Date.now();
        };

        const check = () => {
            const timeDiff = Date.now() - lastActivity.current;

            onUpdate(Math.max(0, timeoutMs - timeDiff));

            if (timeDiff >= timeoutMs) {
                lastActivity.current = Date.now();
                onIdleRef.current();
            }
        };

        // capture: true also catches scroll events, which don't bubble
        ACTIVITY_EVENTS.forEach((e) =>
            window.addEventListener(e, markActive, { passive: true, capture: true }),
        );
        const interval = setInterval(check, 1000);
        document.addEventListener("visibilitychange", check);

        return () => {
            ACTIVITY_EVENTS.forEach((e) =>
                window.removeEventListener(e, markActive, { capture: true }),
            );
            clearInterval(interval);
            document.removeEventListener("visibilitychange", check);
        };
    }, [timeoutMs, enabled]);
}