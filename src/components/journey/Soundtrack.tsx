"use client";

import { useEffect, useRef, useState } from "react";

const tracks = ["/audio/starfield-romance.mp3", "/audio/the-beach-where-dreams-die.mp3"];

/** A real-time playlist: scroll position never seeks or changes the music. */
export function Soundtrack() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.45;
    // Autoplay is a browser decision. A rejected attempt leaves an honest off state.
    void audio.play().catch(() => {});
    return () => audio.pause();
  }, []);

  async function play() {
    const audio = audioRef.current;
    if (!audio) return;
    setFailed(false);
    try {
      await audio.play();
    } catch (error) {
      setPlaying(false);
      if (!(error instanceof DOMException && error.name === "NotAllowedError")) setFailed(true);
    }
  }

  function nextTrack() {
    const audio = audioRef.current;
    if (!audio) return;
    trackRef.current = (trackRef.current + 1) % tracks.length;
    audio.src = tracks[trackRef.current];
    void play();
  }

  return (
    <div className="fixed left-6 top-4 z-50 md:left-[11%]">
      <audio ref={audioRef} src={tracks[0]} preload="metadata" onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={nextTrack} onError={() => { setPlaying(false); setFailed(true); }} />
      <button
        type="button"
        aria-label={playing ? "Pause music" : "Play music"}
        aria-pressed={playing}
        title={playing ? "Pause music" : "Play music"}
        onClick={() => playing ? audioRef.current?.pause() : void play()}
        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-night/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory"
      >
        <svg viewBox="395 395 465 475" width="44" height="44" aria-hidden="true" style={{ imageRendering: "pixelated" }}>
          <image href={playing ? "/sound/volume-on.png" : "/sound/volume-off.png"} width="1254" height="1254" />
        </svg>
      </button>
      {failed && <span role="status" className="absolute left-0 top-14 w-44 rounded bg-night p-2 text-sm text-ivory">Music couldn’t load. Tap to retry.</span>}
    </div>
  );
}
