import general from './general.md?raw';
import buddy from './buddy.md?raw';
import storyGeneration from './story-generation.md?raw';
import psychologist from './psychologist.md?raw';

export const SYSTEM_PROMPT_PRESETS = [
  { id: 'general', label: 'General', prompt: general.trim() },
  { id: 'buddy', label: 'Buddy', prompt: buddy.trim() },
  { id: 'story-generation', label: 'Story generation', prompt: storyGeneration.trim() },
  { id: 'psychologist', label: 'Psychologist', prompt: psychologist.trim() },
];
