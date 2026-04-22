'use client';

import { useRef, useState, useEffect } from 'react';
import { THEMES } from '../lib/themes';

/**
 * Plays ambient background sounds matching the story theme.
 * @param {{ theme: string, isPlaying: boolean }} props
 */
export default function AmbientPlayer({ theme, isPlaying }) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef(null);
  const urlRef = useRef(null);

  const themeConfig = THEMES.find((t) => t.id === theme);

  // Fetch ambient sound on mount
  useEffect(() => {
    if (!themeConfig?.ambientPrompt) return;

    let cancelled = false;

    async function fetchAmbient() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch('/api/sound-effect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: themeConfig.ambientPrompt }),
        });

        if (!res.ok) throw new Error('Failed');
        if (cancelled) return;

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;

        const audio = audioRef.current;
        if (audio) {
          audio.src = url;
          audio.loop = true;
          audio.volume = 0.15;
          audio.load();
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAmbient();

    return () => {
      cancelled = true;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // Play/pause based on narration state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !loaded) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, loaded]);

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} aria-hidden="true" />

      {loaded && (
        <div className="flex items-center justify-center gap-2 text-xs opacity-50" style={{ color: 'var(--gold-dim)' }}>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" 
            style={{ animation: isPlaying ? 'gentle-pulse 2s ease-in-out infinite' : 'none' }} 
          />
          <span>{isPlaying ? 'Ambient sounds playing' : 'Ambient sounds ready'}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 text-xs opacity-40" style={{ color: 'var(--gold-dim)' }}>
          <span>Loading ambient sounds…</span>
        </div>
      )}
    </>
  );
}