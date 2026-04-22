'use client';

import { useState, useCallback, useMemo } from 'react';
import StoryInputForm from '@/src/components/StoryInputForm';
import LoadingOverlay from '@/src/components/LoadingOverlay';
import StoryCard from '@/src/components/StoryCard';
import NarrationPlayer from '@/src/components/NarrationPlayer';
import AmbientPlayer from '@/src/components/AmbientPlayer';

/** Generate random stars for the background */
function generateStars(count) {
  const stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      dur: `${2 + Math.random() * 5}s`,
      delay: `${Math.random() * 4}s`,
      peak: 0.3 + Math.random() * 0.7,
      large: Math.random() > 0.85,
    });
  }
  return stars;
}

export default function Home() {
  const [session, setSession] = useState({
    childName: '',
    theme: '',
    voiceId: '',
    storyText: null,
    status: 'input',
  });
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(null);
  const [storySegments, setStorySegments] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isNarrationPlaying, setIsNarrationPlaying] = useState(false);

  const stars = useMemo(() => generateStars(80), []);

  async function generateStory(name, theme, voiceId) {
    setSession({ childName: name, theme, voiceId, storyText: null, status: 'generating' });
    setActiveSegmentIndex(null);
    setStorySegments([]);
    setErrorMessage('');
    setIsNarrationPlaying(false);

    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, theme }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'Story generation failed.');
      }

      setSession((prev) => ({ ...prev, storyText: data.story, status: 'ready' }));
    } catch {
      setSession((prev) => ({ ...prev, status: 'error' }));
      setErrorMessage(
        "Oops! We couldn't weave your story right now. Please try again."
      );
    }
  }

  function handleNewStory() {
    setSession({ childName: '', theme: '', voiceId: '', storyText: null, status: 'input' });
    setActiveSegmentIndex(null);
    setStorySegments([]);
    setErrorMessage('');
    setIsNarrationPlaying(false);
  }

  function handleRetry() {
    generateStory(session.childName, session.theme, session.voiceId);
  }

  const handleSegmentChange = useCallback((idx) => {
    setActiveSegmentIndex(idx);
  }, []);

  const handlePlayStateChange = useCallback((playing) => {
    setIsNarrationPlaying(playing);
  }, []);

  const isGenerating = session.status === 'generating';
  const isReady = session.status === 'ready' || session.status === 'narrating';
  const isError = session.status === 'error';

  return (
    <>
      <LoadingOverlay message="Weaving your story…" isVisible={isGenerating} />

      {/* Starfield */}
      <div className="starfield">
        {stars.map((s) => (
          <div
            key={s.id}
            className={`star ${s.large ? 'star--large' : ''}`}
            style={{
              left: s.left,
              top: s.top,
              '--dur': s.dur,
              '--peak': s.peak,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center gap-10 w-full max-w-2xl">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="moon-glow inline-block text-6xl mb-4">🌙</div>
            <h1
              className="text-4xl font-extrabold tracking-tight sm:text-5xl"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'linear-gradient(135deg, #f0c654, #f8e8a0, #f0c654)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Storytime
            </h1>
            <p
              className="mt-3 text-lg tracking-wide opacity-70"
              style={{ fontFamily: 'var(--font-body)', color: '#c4b8a0' }}
            >
              Personalized bedtime stories, narrated just for you
            </p>
          </div>

          {/* Input form */}
          {(session.status === 'input' || isError) && (
            <div className="w-full animate-fade-in-up animation-delay-200">
              {isError && (
                <div
                  role="alert"
                  className="w-full rounded-2xl glass-card px-6 py-4 text-center mb-6"
                  style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <p className="text-red-300 font-medium">{errorMessage}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-3 rounded-full px-5 py-2 text-sm font-bold transition"
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#fca5a5',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    Try Again
                  </button>
                </div>
              )}
              <StoryInputForm
                onSubmit={generateStory}
                isLoading={isGenerating}
              />
            </div>
          )}

          {/* Story display */}
          {isReady && session.storyText && (
            <div className="w-full flex flex-col items-center gap-6 animate-fade-in-up">
              <StoryCard
                story={session.storyText}
                theme={session.theme}
                childName={session.childName}
                activeSegmentIndex={activeSegmentIndex}
                onNewStory={handleNewStory}
                onSegmentsReady={setStorySegments}
              />
              <NarrationPlayer
                storyText={session.storyText}
                segments={storySegments}
                voiceId={session.voiceId}
                onSegmentChange={handleSegmentChange}
                onPlayStateChange={handlePlayStateChange}
              />
              <AmbientPlayer
                theme={session.theme}
                isPlaying={isNarrationPlaying}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <p
          className="mt-16 text-xs tracking-widest uppercase opacity-30"
          style={{ color: '#8a7f6e' }}
        >
          Built with Kiro + ElevenLabs
        </p>
      </main>
    </>
  );
}