"use client";

import { useEffect, useRef, useState } from "react";

const volumeLevels = [0.1, 0.25, 0.5, 1];

const tracks = ["/audio/starfield-romance.mp3", "/audio/the-beach-where-dreams-die.mp3"];

/** A real-time playlist: scroll position never seeks or changes the music. */
export function Soundtrack() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [volumeStep, setVolumeStep] = useState(2);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volumeLevels[1];
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
    <div className="fixed left-4 top-11 z-50 flex items-center md:left-[calc(11%-8px)] md:top-[calc(max(6rem,10vh)-3.25rem)]">
      <audio ref={audioRef} src={tracks[0]} preload="metadata" onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={nextTrack} onError={() => { setPlaying(false); setFailed(true); }} />
      <button
        type="button"
        aria-label={playing ? "Pause music" : "Play music"}
        aria-pressed={playing}
        title={playing ? "Pause music" : "Play music"}
        onClick={() => playing ? audioRef.current?.pause() : void play()}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full opacity-55 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory"
      >
        <svg viewBox="395 395 465 475" width="28" height="28" aria-hidden="true" style={{ imageRendering: "pixelated" }}>
          <image href={playing ? "/sound/volume-on.png" : "/sound/volume-off.png"} width="1254" height="1254" />
        </svg>
      </button>
      <label className="group relative flex h-11 cursor-pointer items-center gap-[5.35px] rounded-sm focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-ivory">
        <span className="sr-only">Music volume</span>
        {volumeLevels.map((_, index) => (
          <span key={index} aria-hidden="true" className={`h-3 w-3 border border-ivory/55 ${index < volumeStep ? "bg-ivory/55" : "bg-transparent"}`} />
        ))}
        <input
          type="range"
          min="1"
          max="4"
          step="1"
          value={volumeStep}
          aria-valuetext={`Level ${volumeStep} of 4${volumeStep === 1 ? ", lowest" : volumeStep === 4 ? ", highest" : ""}`}
          onChange={(event) => {
            const step = Number(event.target.value);
            setVolumeStep(step);
            if (audioRef.current) audioRef.current.volume = volumeLevels[step - 1];
          }}
          className="absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      {failed && <span role="status" className="absolute left-0 top-14 w-44 rounded bg-night p-2 text-sm text-ivory">Music couldn’t load. Tap to retry.</span>}
    </div>
  );
}
