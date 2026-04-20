/**
 * Builds a Gemini prompt for generating a personalized bedtime story.
 *
 * @param {string} name - The child's name (will be trimmed and capped at 50 chars)
 * @param {import('./types').StoryTheme} theme - The selected story theme
 * @returns {string} The prompt string to send to the Gemini API
 */
export function buildStoryPrompt(name, theme) {
  const safeName = name.trim().slice(0, 50);
  return `Write a bedtime story for a child aged 3–8.
- The main character is named ${safeName}.
- The story theme is: ${theme}.
- The story must be between 150 and 250 words.
- Use simple, warm, and positive language.
- The story must end on a happy or peaceful note.
- Do not include any scary, violent, or inappropriate content.
- Write only the story text, no title or extra commentary.`;
}
