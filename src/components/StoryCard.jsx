'use client';

import { useMemo, useEffect } from 'react';
import { THEMES } from '../lib/themes';

/**
 * Splits story text into sentence segments.
 * @param {string} text
 * @returns {string[]}
 */
export function splitIntoSegments(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * @param {{
 *   story: string,
 *   theme: string,
 *   childName: string,
 *   activeSegmentIndex: number | null,
 *   onNewStory: () => void,
 *   onSegmentsReady: (segments: string[]) => void
 * }} props
 */
export default function StoryCard({
  story,
  theme,
  childName,
  activeSegmentIndex,
  onNewStory,
  onSegmentsReady,
}) {
  const themeConfig = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  const segments = useMemo(() => {
    return splitIntoSegments(story);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story]);

  useEffect(() => {
    onSegmentsReady?.(segments);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  return (
    <div className="w-full max-w-2xl">
      {/* Story header */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <span className="text-3xl">{themeConfig.emoji}</span>
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--gold-dim)' }}
          >
            {themeConfig.label}
          </p>
          <p className="text-sm opacity-50" style={{ color: '#c4b8a0' }}>
            A story for {childName}
          </p>
        </div>
      </div>

      {/* Story card */}
      <div
        className="glass-card rounded-3xl overflow-hidden"
        style={{
          background: themeConfig.bg || 'var(--card-bg)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Top gradient accent */}
        <div
          className={`h-1.5 bg-gradient-to-r ${themeConfig.gradient}`}
        />

        {/* Story text */}
        <div className="px-8 py-10 sm:px-10">
          <p
            className="text-xl leading-10 tracking-wide"
            style={{
              fontFamily: 'var(--font-body)',
              color: '#e8e0d4',
            }}
            aria-live="polite"
          >
            {segments.map((segment, idx) => (
              <span
                key={idx}
                data-segment-index={idx}
                className={`transition-all duration-300 ${
                  activeSegmentIndex === idx ? 'segment-active' : ''
                }`}
              >
                {segment}{' '}
              </span>
            ))}
          </p>
        </div>

        {/* Bottom bar */}
        <div
          className="flex justify-center px-8 py-5"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            background: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          <button
            onClick={onNewStory}
            aria-label="Create a new story"
            className="rounded-full px-6 py-2.5 text-sm font-semibold transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            style={{
              background: 'rgba(240, 198, 84, 0.12)',
              color: 'var(--gold)',
              border: '1px solid rgba(240, 198, 84, 0.25)',
            }}
          >
            ✦ New Story
          </button>
        </div>
      </div>
    </div>
  );
}