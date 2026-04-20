# Implementation Plan: Storytime AI Narrator

## Overview

Build a React (Next.js) web app that generates personalized AI bedtime stories via the Google Gemini API and narrates them aloud via ElevenLabs TTS. The implementation is split into: shared types and theme config, serverless API routes, React UI components, and final wiring.

## Tasks

- [x] 1. Initialize project and shared configuration
  - Scaffold a Next.js project with Tailwind CSS
  - Create `src/lib/themes.js` exporting the `THEMES` object — a map of all 6 `StoryTheme` values to their `ThemeConfig` (label, emoji, gradient)
  - Create `src/lib/types.js` (JSDoc typedefs) defining `StoryTheme`, `ThemeConfig`, `StorySession`, and `SessionStatus`
  - Add `.env.local.example` with `GOOGLE_GEMINI_API_KEY` and `ELEVENLABS_API_KEY` placeholders
  - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 1.1 Write property test for ThemeConfig completeness
    - **Property 4: ThemeConfig completeness invariant**
    - For every entry in `THEMES`, assert `gradient`, `emoji`, and `label` are all non-empty strings
    - **Validates: Requirements 7.2, 7.3**

- [x] 2. Implement the StoryGenerator serverless function
  - [x] 2.1 Create `src/lib/promptBuilder.js` with `buildStoryPrompt(name, theme)`
    - Returns a prompt string that includes the child's name and the theme as substrings
    - Trims name and limits it to 50 characters
    - _Requirements: 5.3, 5.5, 9.2_

  - [ ]* 2.2 Write property test for `buildStoryPrompt`
    - **Property 1: Prompt contains name and theme**
    - For any non-empty name and valid StoryTheme, assert the output contains both as substrings
    - **Validates: Requirements 5.3**

  - [x] 2.3 Create `pages/api/generate-story.js` (POST handler)
    - Validate `name` is non-empty/non-whitespace and `theme` is one of the 6 allowed values; return 400 with descriptive message on failure
    - Trim and cap name to 50 chars, call `buildStoryPrompt`, then call the Gemini API using `GOOGLE_GEMINI_API_KEY`
    - Return the generated story text; on Gemini failure return a structured `{ error }` response
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 5.7, 5.8, 9.1, 9.2, 9.3_

  - [ ]* 2.4 Write property test for server-side input validation
    - **Property 3: Server-side input validation rejects invalid inputs**
    - For any empty/whitespace name or invalid theme, assert the handler returns 400 and does NOT call the Gemini API
    - **Validates: Requirements 5.4, 5.6, 9.1, 9.2**

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement the NarrationProxy serverless function
  - Create `pages/api/narrate.js` (POST handler)
  - Accept `{ text, voice_id? }` in the request body; use a default warm narrator voice_id if none provided
  - Call ElevenLabs TTS API with `eleven_multilingual_v2` model using `ELEVENLABS_API_KEY`
  - Stream/return the MP3 binary with `Content-Type: audio/mpeg`; on failure return a structured `{ error }` response
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 9.3_

- [x] 5. Implement the StoryInputForm component
  - [x] 5.1 Create `src/components/StoryInputForm.jsx`
    - Render a text input for the child's name and 6 theme selector buttons (using `THEMES` config for labels/emojis)
    - On submit: trim name; if empty show inline validation message "Please enter your child's name to begin the story." and do NOT call `onSubmit`
    - If valid, call `onSubmit(trimmedName, selectedTheme)`
    - Disable submit button and show loading indicator while `isLoading` prop is true
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 5.2 Write property test for StoryInputForm empty-name blocking
    - **Property 5: StoryInputForm blocks empty or whitespace-only name submission**
    - For any whitespace-only or empty name string, assert `onSubmit` is never called and the validation message is shown
    - **Validates: Requirements 1.2, 1.3**

- [x] 6. Implement the LoadingOverlay component
  - Create `src/components/LoadingOverlay.jsx`
  - Render a full-screen overlay with the message "Weaving your story…" when `isVisible` prop is true
  - Overlay must block pointer events on the form beneath it while visible
  - Hide completely when `isVisible` is false
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. Implement the NarrationPlayer component
  - [x] 7.1 Create `src/components/NarrationPlayer.jsx` with internal state machine: `idle → loading → playing → paused → idle`
    - On "Listen to Story" click (idle state): POST to `/api/narrate` with story text, transition to `loading`
    - On success: load audio blob into an `<audio>` element, transition to `playing`
    - Emit `onSegmentChange(index)` on a time-based interval while playing to drive sentence highlighting
    - Support play, pause, and restart controls
    - On fetch/load failure: display "We couldn't load the audio right now, but you can still read the story below." and a "Retry Audio" button
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 7.2 Write property test for NarrationPlayer state transitions
    - **Property 6: NarrationPlayer state transitions are valid**
    - For any sequence of play/pause/restart interactions, assert the status only moves through `idle → loading → playing → paused → idle` and never reaches an undefined state
    - **Validates: Requirements 3.2, 3.4**

- [x] 8. Implement the StoryCard component
  - [x] 8.1 Create `src/components/StoryCard.jsx`
    - Split story text into sentence segments and render each in its own `<span>`
    - Apply the themed background gradient from `THEMES[theme].gradient`
    - Render a "New Story" button that calls `onNewStory`
    - _Requirements: 2.1, 2.3_

  - [x] 8.2 Add active segment highlighting to StoryCard
    - Accept `activeSegmentIndex` prop; apply a highlight CSS class to exactly the segment at that index
    - All other segments must NOT have the highlight class
    - _Requirements: 2.2, 3.3_

  - [ ]* 8.3 Write property test for StoryCard segment highlighting
    - **Property 7: StoryCard highlights the correct active segment**
    - For any story text and any valid `activeSegmentIndex`, assert exactly one segment has the highlight class and it is the one at that index
    - **Validates: Requirements 2.2, 3.3**

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement top-level session state and error recovery in `pages/index.jsx`
  - Manage `StorySession` state: `{ childName, theme, storyText, audioUrl, status }`
  - On form submit: set status to `generating`, show `LoadingOverlay`, POST to `/api/generate-story`
  - On success: set status to `ready`, hide overlay, render `StoryCard` + `NarrationPlayer`
  - On story generation failure: set status to `error`, hide overlay, display banner "Oops! We couldn't weave your story right now. Please try again." and a "Try Again" button that re-submits the same name and theme
  - On audio failure: keep story text visible; `NarrationPlayer` handles its own error display
  - Handle network errors with the same error/retry flow as API failures
  - _Requirements: 4.3, 8.1, 8.2, 8.3, 8.4_

- [x] 11. Wire all components together and apply Tailwind styling
  - Import and compose `StoryInputForm`, `LoadingOverlay`, `StoryCard`, and `NarrationPlayer` in `pages/index.jsx`
  - Pass `activeSegmentIndex` from `NarrationPlayer`'s `onSegmentChange` down to `StoryCard`
  - Apply Tailwind classes for a storybook-style, child-friendly visual design
  - Verify the full happy path: input → loading → story display → audio playback → new story
  - _Requirements: 1.1, 2.1, 3.3, 4.1_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties (Properties 1–7 from the design)
- Unit tests validate specific examples and edge cases
- API keys must only ever appear in server-side environment variables — never in client bundles
