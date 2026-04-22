'use client';

import { useState } from 'react';
import { THEMES, VOICES } from '../lib/themes';

/**
 * @param {{ onSubmit: (name: string, theme: string, voiceId: string) => void, isLoading: boolean }} props
 */
export default function StoryInputForm({ onSubmit, isLoading }) {
  const [name, setName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0].id);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [validationError, setValidationError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError("Please enter your child's name to begin the story.");
      return;
    }
    setValidationError('');
    onSubmit(trimmed, selectedTheme, selectedVoice);
  }

  return (
    <div className="glass-card rounded-3xl px-8 py-10 w-full max-w-lg mx-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 w-full"
        aria-label="Story creation form"
      >
        {/* Child's name */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="child-name"
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--gold-dim)' }}
          >
            Child&apos;s Name
          </label>
          <input
            id="child-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="e.g. Luna"
            maxLength={50}
            aria-describedby={validationError ? 'name-error' : undefined}
            aria-invalid={!!validationError}
            className="rounded-xl px-5 py-4 text-lg transition focus:outline-none focus:ring-2"
            style={{
              background: 'rgba(255, 255, 255, 0.07)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#e8e0d4',
              fontFamily: 'var(--font-body)',
            }}
          />
          {validationError && (
            <p id="name-error" role="alert" className="text-red-400 text-sm font-medium">
              {validationError}
            </p>
          )}
        </div>

        {/* Theme selection */}
        <div className="flex flex-col gap-3">
          <p
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--gold-dim)' }}
          >
            Choose a Theme
          </p>
          <div
            role="radiogroup"
            aria-label="Story theme"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={selectedTheme === theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`theme-option flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
                  selectedTheme === theme.id ? 'theme-option--selected' : ''
                }`}
                style={{
                  background:
                    selectedTheme === theme.id
                      ? 'rgba(240, 198, 84, 0.12)'
                      : 'rgba(255, 255, 255, 0.04)',
                  border:
                    selectedTheme === theme.id
                      ? '1px solid rgba(240, 198, 84, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  color:
                    selectedTheme === theme.id ? '#f0c654' : 'rgba(232, 224, 212, 0.7)',
                }}
              >
                <span className="text-2xl" aria-hidden="true">{theme.emoji}</span>
                <span>{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Voice picker */}
        <div className="flex flex-col gap-3">
          <p
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--gold-dim)' }}
          >
            Pick a Narrator
          </p>
          <div
            role="radiogroup"
            aria-label="Narrator voice"
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {VOICES.map((voice) => (
              <button
                key={voice.id}
                type="button"
                role="radio"
                aria-checked={selectedVoice === voice.id}
                onClick={() => setSelectedVoice(voice.id)}
                className={`theme-option flex flex-col items-center gap-1.5 rounded-xl px-3 py-3.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-yellow-500/50 ${
                  selectedVoice === voice.id ? 'theme-option--selected' : ''
                }`}
                style={{
                  background:
                    selectedVoice === voice.id
                      ? 'rgba(240, 198, 84, 0.12)'
                      : 'rgba(255, 255, 255, 0.04)',
                  border:
                    selectedVoice === voice.id
                      ? '1px solid rgba(240, 198, 84, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                  color:
                    selectedVoice === voice.id ? '#f0c654' : 'rgba(232, 224, 212, 0.7)',
                }}
              >
                <span className="text-xl" aria-hidden="true">{voice.emoji}</span>
                <span className="text-xs font-semibold">{voice.label}</span>
                <span className="text-[10px] opacity-60">{voice.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
          className="btn-glow rounded-full px-8 py-4 text-lg font-bold shadow-lg transition focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #f0c654, #c9a23a)',
            color: '#1a1205',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.02em',
          }}
        >
          {isLoading ? 'Creating…' : '✨ Create Story'}
        </button>
      </form>
    </div>
  );
}