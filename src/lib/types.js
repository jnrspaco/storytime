/**
 * @typedef {'Space Adventure' | 'Underwater Kingdom' | 'Enchanted Forest' | 'Dinosaur Quest' | 'Pirate Treasure' | 'Robot Friends'} StoryTheme
 */

/**
 * @typedef {Object} ThemeConfig
 * @property {StoryTheme} id - The theme identifier
 * @property {string} label - Display label matching the StoryTheme id
 * @property {string} emoji - Emoji representing the theme
 * @property {string} gradient - Tailwind CSS gradient classes (from-X to-Y)
 */

/**
 * @typedef {'input' | 'generating' | 'ready' | 'narrating' | 'error'} SessionStatus
 */

/**
 * @typedef {Object} StorySession
 * @property {string} childName - The child's name
 * @property {StoryTheme} theme - The selected story theme
 * @property {string | null} storyText - The generated story text
 * @property {string | null} audioUrl - The URL of the generated audio
 * @property {SessionStatus} status - The current session status
 */
