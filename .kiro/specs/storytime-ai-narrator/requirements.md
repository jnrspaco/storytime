# Requirements Document

## Introduction

Storytime AI Narrator is a web application that generates personalized, age-appropriate bedtime stories for children using the Google Gemini AI API, then narrates them aloud via ElevenLabs text-to-speech in a warm storyteller voice. A parent enters their child's name, selects a story theme, and receives a unique story ready to play — all within a single, magical browser experience. The app is built with React (Next.js or Vite) and Tailwind CSS, deployed on Vercel or Netlify using serverless functions to keep API keys secure on the server side.

## Glossary

- **StoryInputForm**: The React component that collects the child's name and story theme from the parent.
- **StoryCard**: The React component that displays the generated story in a storybook-style layout with themed visuals.
- **NarrationPlayer**: The React component that controls audio playback of the ElevenLabs-generated narration.
- **LoadingOverlay**: The React component that provides visual feedback during story generation.
- **StoryGenerator**: The serverless function at `/api/generate-story` that proxies requests to the Google Gemini API.
- **NarrationProxy**: The serverless function at `/api/narrate` that proxies requests to the ElevenLabs TTS API.
- **StoryTheme**: One of six fixed story themes: "Space Adventure", "Underwater Kingdom", "Enchanted Forest", "Dinosaur Quest", "Pirate Treasure", or "Robot Friends".
- **ThemeConfig**: A data record mapping a StoryTheme to its visual presentation (label, emoji, gradient).
- **StorySession**: The in-memory state of a single story session, including child name, theme, story text, audio URL, and session status.
- **SessionStatus**: One of five states: "input", "generating", "ready", "narrating", or "error".
- **Prompt_Builder**: The `buildStoryPrompt` function that constructs the Gemini API prompt from a name and theme.

---

## Requirements

### Requirement 1: Story Input Form

**User Story:** As a parent, I want to enter my child's name and select a story theme, so that I can generate a personalized bedtime story for my child.

#### Acceptance Criteria

1. THE StoryInputForm SHALL render a text input field for the child's name and at least 6 selectable theme options corresponding to the defined StoryTheme values.
2. WHEN a parent clicks the submit button without entering a child's name, THE StoryInputForm SHALL prevent form submission and display an inline validation message: "Please enter your child's name to begin the story."
3. WHEN a parent enters a valid non-empty name and selects a theme and clicks "Create Story", THE StoryInputForm SHALL invoke the onSubmit callback with the trimmed name and selected theme.
4. WHILE story generation is in progress, THE StoryInputForm SHALL disable the submit button and display a loading state indicator.

---

### Requirement 2: Story Display

**User Story:** As a parent, I want to see the generated story displayed in a visually appealing storybook layout, so that my child and I can read it together.

#### Acceptance Criteria

1. WHEN a story is generated, THE StoryCard SHALL display the story text in a styled card with a themed background gradient corresponding to the selected StoryTheme.
2. WHILE audio narration is playing, THE StoryCard SHALL visually highlight the sentence or segment at the current activeSegmentIndex.
3. THE StoryCard SHALL display a "New Story" button that, when clicked, invokes the onNewStory callback to return the user to the input form.

---

### Requirement 3: Audio Narration Playback

**User Story:** As a parent, I want to play an audio narration of the story, so that my child can listen to the story being read aloud.

#### Acceptance Criteria

1. WHEN the user clicks "Listen to Story" and the NarrationPlayer is in the idle state, THE NarrationPlayer SHALL call `/api/narrate` with the story text to fetch the audio.
2. WHEN audio is fetched successfully, THE NarrationPlayer SHALL load the audio blob into an HTML audio element and transition to the playing state.
3. WHILE audio is playing, THE NarrationPlayer SHALL emit onSegmentChange events with the current segment index to enable sentence highlighting in the StoryCard.
4. THE NarrationPlayer SHALL support play, pause, and restart controls for the loaded audio.
5. IF the call to `/api/narrate` fails or the audio fails to load, THEN THE NarrationPlayer SHALL display an inline error message: "We couldn't load the audio right now, but you can still read the story below."
6. IF the call to `/api/narrate` fails, THEN THE NarrationPlayer SHALL display a "Retry Audio" button that re-attempts the narration request without requiring the user to re-enter any information.

---

### Requirement 4: Loading Feedback

**User Story:** As a parent, I want to see a loading indicator while the story is being generated, so that I know the app is working and I don't accidentally submit the form twice.

#### Acceptance Criteria

1. WHILE story generation is in progress, THE LoadingOverlay SHALL be visible and display a contextual loading message (e.g., "Weaving your story…").
2. WHILE THE LoadingOverlay is visible, THE LoadingOverlay SHALL block user interaction with the story input form.
3. WHEN story generation completes or fails, THE LoadingOverlay SHALL become hidden.

---

### Requirement 5: Story Generation Serverless Function

**User Story:** As a developer, I want a secure server-side function to generate stories via the Gemini API, so that API keys are never exposed to the browser.

#### Acceptance Criteria

1. WHEN a POST request with a valid name and theme is received, THE StoryGenerator SHALL construct a prompt using the Prompt_Builder and call the Google Gemini API to generate a bedtime story.
2. THE StoryGenerator SHALL return a story text that is between 150 and 250 words in length.
3. THE Prompt_Builder SHALL produce a prompt string that contains the child's name and the selected StoryTheme as substrings.
4. THE StoryGenerator SHALL validate that the name field is non-empty and the theme is one of the 6 allowed StoryTheme values before calling the Gemini API.
5. THE StoryGenerator SHALL trim the name input and limit it to a maximum of 50 characters before interpolating it into the prompt.
6. IF the name is empty or the theme is not a valid StoryTheme, THEN THE StoryGenerator SHALL return a 400 error response with a descriptive error message.
7. IF the Google Gemini API call fails or times out, THEN THE StoryGenerator SHALL return a structured error response with an `error` field containing a descriptive message.
8. THE StoryGenerator SHALL use the `GOOGLE_GEMINI_API_KEY` environment variable and SHALL NOT expose it in any response to the client.

---

### Requirement 6: Text-to-Speech Narration Serverless Function

**User Story:** As a developer, I want a secure server-side function to proxy TTS requests to ElevenLabs, so that the ElevenLabs API key is never exposed to the browser.

#### Acceptance Criteria

1. WHEN a POST request with story text is received, THE NarrationProxy SHALL call the ElevenLabs TTS API using the `eleven_multilingual_v2` model and return the MP3 audio binary with `Content-Type: audio/mpeg`.
2. WHERE a voice_id is provided in the request, THE NarrationProxy SHALL use that voice_id; otherwise THE NarrationProxy SHALL use a default warm narrator voice.
3. IF the ElevenLabs API call fails, THEN THE NarrationProxy SHALL return a structured error response with an `error` field containing a descriptive message.
4. THE NarrationProxy SHALL use the `ELEVENLABS_API_KEY` environment variable and SHALL NOT expose it in any response to the client.

---

### Requirement 7: Theme Configuration

**User Story:** As a developer, I want all story themes to have complete visual configuration, so that the StoryCard can render correctly for any theme.

#### Acceptance Criteria

1. THE ThemeConfig collection SHALL contain exactly 6 entries, one for each StoryTheme value.
2. FOR ALL ThemeConfig entries, THE ThemeConfig SHALL have a non-empty gradient string and a non-empty emoji string.
3. FOR ALL ThemeConfig entries, THE ThemeConfig SHALL have a non-empty label string matching the StoryTheme id.

---

### Requirement 8: Error Recovery

**User Story:** As a parent, I want to be able to retry after an error without losing my input, so that a temporary API failure doesn't force me to start over.

#### Acceptance Criteria

1. IF story generation fails, THEN THE System SHALL display a friendly error banner: "Oops! We couldn't weave your story right now. Please try again."
2. IF story generation fails, THEN THE System SHALL display a "Try Again" button that re-submits the same name and theme without requiring the parent to re-enter them.
3. IF audio narration fails, THEN THE System SHALL keep the written story text fully visible and readable.
4. IF a network connectivity issue causes a fetch call to fail, THEN THE System SHALL apply the same error handling and retry behavior as for API failures.

---

### Requirement 9: Security and Input Sanitization

**User Story:** As a system operator, I want all API keys to remain server-side and all user inputs to be sanitized, so that the application is secure against key exposure and prompt injection.

#### Acceptance Criteria

1. THE StoryGenerator SHALL validate the theme value against the fixed set of 6 allowed StoryTheme values server-side before using it in any API call.
2. THE StoryGenerator SHALL trim and length-limit the name input to a maximum of 50 characters server-side before interpolating it into the Gemini prompt.
3. THE System SHALL never include `GOOGLE_GEMINI_API_KEY` or `ELEVENLABS_API_KEY` in any HTTP response sent to the browser.
