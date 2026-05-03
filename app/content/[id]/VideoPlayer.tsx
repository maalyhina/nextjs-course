"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

interface Props {
  src: string;
  contentId: string;
  episodeId?: string;
  initialProgress?: number;
}

export default function VideoPlayer({ src, contentId, episodeId, initialProgress = 0 }: Props) {
  const { data: session } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // відновити прогрес
    if (initialProgress > 0) {
      video.currentTime = initialProgress;
    }

    // зберігати прогрес кожні 10 секунд
    function startSaving() {
      if (!session?.user) return;
      saveInterval.current = setInterval(async () => {
        const progress = Math.floor(video!.currentTime);
        if (progress > 0) {
          await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contentId, episodeId, progress }),
          });
        }
      }, 10000);
    }

    function stopSaving() {
      if (saveInterval.current) clearInterval(saveInterval.current);
    }

    video.addEventListener("play", startSaving);
    video.addEventListener("pause", stopSaving);
    video.addEventListener("ended", stopSaving);

    return () => {
      stopSaving();
      video.removeEventListener("play", startSaving);
      video.removeEventListener("pause", stopSaving);
      video.removeEventListener("ended", stopSaving);
    };
  }, [session, contentId, episodeId, initialProgress]);

  return (
    <video
      ref={videoRef}
      controls
      style={{ width: "100%", maxHeight: "500px", display: "block" }}
      src={src}
    />
  );
}