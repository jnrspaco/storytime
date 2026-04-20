import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { THEMES } from './themes.js';

/**
 * Property 4: ThemeConfig completeness invariant
 *
 * For all entries in the THEMES collection, each ThemeConfig SHALL have a
 * non-empty `gradient` string, a non-empty `emoji` string, and a non-empty
 * `label` string.
 *
 * **Validates: Requirements 7.2, 7.3**
 */
describe('THEMES', () => {
  it('should contain exactly 6 entries (Requirement 7.1)', () => {
    expect(THEMES).toHaveLength(6);
  });

  it('Property 4: every ThemeConfig has non-empty gradient, emoji, and label', () => {
    // Use fast-check to sample indices into the THEMES array
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: THEMES.length - 1 }),
        (index) => {
          const theme = THEMES[index];
          expect(typeof theme.gradient).toBe('string');
          expect(theme.gradient.length).toBeGreaterThan(0);

          expect(typeof theme.emoji).toBe('string');
          expect(theme.emoji.length).toBeGreaterThan(0);

          expect(typeof theme.label).toBe('string');
          expect(theme.label.length).toBeGreaterThan(0);
        }
      )
    );
  });

  it('every ThemeConfig label matches its id', () => {
    THEMES.forEach((theme) => {
      expect(theme.label).toBe(theme.id);
    });
  });
});
