'use client';

/**
 * @param {{ message: string, isVisible: boolean }} props
 */
export default function LoadingOverlay({ message, isVisible }) {
  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 pointer-events-auto"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(11, 16, 38, 0.92), rgba(11, 16, 38, 0.98))',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Animated icons */}
      <div className="flex gap-4 text-4xl" aria-hidden="true">
        <span
          className="inline-block"
          style={{ animation: 'gentle-pulse 2s ease-in-out infinite' }}
        >
          ✨
        </span>
        <span
          className="inline-block moon-glow"
          style={{ animation: 'gentle-pulse 2s ease-in-out 0.3s infinite' }}
        >
          🌙
        </span>
        <span
          className="inline-block"
          style={{ animation: 'gentle-pulse 2s ease-in-out 0.6s infinite' }}
        >
          ⭐
        </span>
      </div>

      <div className="text-center px-6">
        <p
          className="text-2xl font-bold tracking-wide"
          style={{
            fontFamily: 'var(--font-display)',
            background: 'linear-gradient(135deg, #f0c654, #f8e8a0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {message}
        </p>
        <div
          className="mt-4 mx-auto h-0.5 w-32 rounded-full loading-shimmer"
          style={{ background: 'rgba(240, 198, 84, 0.2)' }}
        />
      </div>
    </div>
  );
}