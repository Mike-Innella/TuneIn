// src/player/YouTubeMount.tsx
import { useEffect } from "react";
import * as yt from "./ytController";

export default function YouTubeMount({ initialVideoId }: { initialVideoId?: string }) {
  useEffect(() => {
    yt.mount("yt-host", initialVideoId);
    return () => {
      // keep singleton alive across route changes; skip destroy unless you must free resources
      // yt.destroy();
    };
  }, [initialVideoId]);

  return (
    <div
      id="yt-host"
      style={{ position: "fixed", left: "-9999px", top: "-9999px", width: 0, height: 0 }}
      aria-hidden
    />
  );
}