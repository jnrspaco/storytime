'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

/** @typedef {'idle'|'loading'|'playing'|'paused'|'error'} PlayerStatus */

export default function NarrationPlayer({ storyText, segments, voiceId, onSegmentChange, onPlayStateChange }) {
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);
  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  // Notify parent of play state changes
  useEffect(() => {
    onPlayStateChange?.(status === 'playing');
  }, [status, onPlayStateChange]);

  const stopTracking = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const startTracking = useCallback(() => {
    stopTracking();
    const audio = audioRef.current;
    if (!audio || segments.length === 0) return;

    intervalRef.current = setInterval(() => {
      if (!audio.duration) return;
      const progress = audio.currentTime / audio.duration;
      const idx = Math.min(
        Math.floor(progress * segments.length),
        segments.length - 1
      );
      onSegmentChange(idx);
    }, 300);
  }, [segments, onSegmentChange, stopTracking]);

  async function fetchAudio() {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const body = { text: storyText };
      if (voiceId) body.voice_id = voiceId;

      const res = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = audioRef.current;
      audio.src = url;
      audio.load();

      audio.oncanplaythrough = () => {
        audio.play();
        setStatus('playing');
        startTracking();
      };

      audio.onerror = () => {
        setStatus('error');
        setErrorMessage(
          "Couldn't load the audio — you can still read the story above."
        );
        stopTracking();
        onSegmentChange(null);
      };

      audio.onended = () => {
        setStatus('idle');
        stopTracking();
        onSegmentChange(null);
      };
    } catch {
      setStatus('error');
      setErrorMessage(
        "Couldn't load the audio — you can still read the story above."
      );
    }
  }

  function handlePlay() {
    if (status === 'idle') {
      fetchAudio();
    } else if (status === 'paused') {
      audioRef.current?.play();
      setStatus('playing');
      startTracking();
    }
  }

  function handlePause() {
    audioRef.current?.pause();
    setStatus('paused');
    stopTracking();
  }

  function handleRestart() {
    const audio = audioRef.current;
    if (!audio) return;
    stopTracking();
    audio.currentTime = 0;
    audio.play();
    setStatus('playing');
    startTracking();
  }

  const buttonBase = {
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    letterSpacing: '0.02em',
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} aria-hidden="true" />

      {status === 'error' && (
        <p role="alert" className="text-red-400 text-sm text-center font-medium">
          {errorMessage}
        </p>
      )}

      <div className="flex items-center gap-3">
        {(status === 'idle' || status === 'error') && (
          <button
            onClick={status === 'error' ? fetchAudio : handlePlay}
            aria-label={status === 'error' ? 'Retry audio' : 'Listen to story'}
            className="flex items-center gap-2 rounded-full px-7 py-3.5 text-base shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            style={{
              ...buttonBase,
              background: 'linear-gradient(135deg, #f0c654, #c9a23a)',
              color: '#1a1205',
            }}
          >
            🎧 {status === 'error' ? 'Retry Audio' : 'Listen to Story'}
          </button>
        )}

        {status === 'loading' && (
          <button
            disabled
            aria-busy="true"
            aria-label="Loading audio"
            className="flex items-center gap-2 rounded-full px-7 py-3.5 text-base cursor-not-allowed loading-shimmer"
            style={{
              ...buttonBase,
              background: 'rgba(240, 198, 84, 0.15)',
              color: 'var(--gold)',
              border: '1px solid rgba(240, 198, 84, 0.25)',
            }}
          >
            ⏳ Loading audio…
          </button>
        )}

        {(status === 'playing' || status === 'paused') && (
          <>
            <button
              onClick={status === 'playing' ? handlePause : handlePlay}
              aria-label={status === 'playing' ? 'Pause narration' : 'Resume narration'}
              className="flex items-center gap-2 rounded-full px-6 py-3.5 text-base shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              style={{
                ...buttonBase,
                background: 'linear-gradient(135deg, #f0c654, #c9a23a)',
                color: '#1a1205',
              }}
            >
              {status === 'playing' ? '⏸ Pause' : '▶ Resume'}
            </button>
            <button
              onClick={handleRestart}
              aria-label="Restart narration"
              className="flex items-center gap-2 rounded-full px-6 py-3.5 text-base transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              style={{
                ...buttonBase,
                background: 'rgba(240, 198, 84, 0.1)',
                color: 'var(--gold)',
                border: '1px solid rgba(240, 198, 84, 0.25)',
              }}
            >
              🔄 Restart
            </button>
          </>
        )}
      </div>
    </div>
  );
}