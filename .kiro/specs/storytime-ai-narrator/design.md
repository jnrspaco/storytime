


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Prompt contains name and theme

*For any* non-empty child name string and valid StoryTheme value, the output of `buildStoryPrompt(name, theme)` SHALL contain the name and the theme string as substrings.

**Validates: Requirements 5.3**

---

### Property 2: Generated story word count is within range

*For any* valid name and StoryTheme submitted to the StoryGenerator, the returned story text SHALL contain between 150 and 250 words (inclusive).

**Validates: Requirements 5.2**

---

### Property 3: Server-side input validation rejects invalid inputs

*For any* request to the StoryGenerator where the name is empty, composed entirely of whitespace, or the theme is not one of the 6 allowed StoryTheme values, THE StoryGenerator SHALL return a 400 error response and SHALL NOT call the Gemini API.

**Validates: Requirements 5.4, 5.6, 9.1, 9.2**

---

### Property 4: ThemeConfig completeness invariant

*For all* entries in the THEMES collection, each ThemeConfig SHALL have a non-empty `gradient` string, a non-empty `emoji` string, and a non-empty `label` string.

**Validates: Requirements 7.2, 7.3**

---

### Property 5: StoryInputForm blocks empty or whitespace-only name submission

*For any* string composed entirely of whitespace characters (including the empty string), submitting the StoryInputForm with that value as the name SHALL be prevented, the onSubmit callback SHALL NOT be invoked, and the validation message SHALL be displayed.

**Validates: Requirements 1.2, 1.3**

---

### Property 6: NarrationPlayer state transitions are valid

*For any* sequence of user interactions (play, pause, restart) on the NarrationPlayer, the player's status SHALL only transition through the valid states: `idle → loading → playing → paused → idle`, and SHALL never enter an undefined state.

**Validates: Requirements 3.2, 3.4**

---

### Property 7: StoryCard highlights the correct active segment

*For any* story text split into segments and any valid activeSegmentIndex, the StoryCard SHALL apply highlight styling to exactly the segment at that index and no other segments.

**Validates: Requirements 2.2, 3.3**
