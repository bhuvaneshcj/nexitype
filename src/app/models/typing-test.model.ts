export interface TypingTestConfig {
  duration: number; // in seconds
  text: string;
  isCustomText: boolean;
}

export interface TypingResult {
  wpm: number;
  accuracy: number;
  totalCharacters: number;
  errors: number;
  timeElapsed: number;
  date: Date;
}

export interface PersonalBest {
  wpm: number;
  accuracy: number;
  date: Date;
  duration: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: Date;
}

export interface TypingStats {
  currentWordIndex: number;
  currentCharIndex: number;
  typedText: string;
  errors: number[];
  isComplete: boolean;
  startTime?: Date;
  endTime?: Date;
}

export const TEST_DURATIONS = [
  { label: '15 seconds', value: 15 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '2 minutes', value: 120 },
];

// Import content from the dedicated content file
export { SAMPLE_TEXTS, DAILY_CHALLENGES, getRandomText, getDailyChallenge } from '../data/typing-content';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-test',
    title: 'First Steps',
    description: 'Complete your first typing test',
    icon: '🚀',
    unlocked: false,
  },
  {
    id: 'wpm-30',
    title: 'Getting Faster',
    description: 'Achieve 30 WPM',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'wpm-50',
    title: 'Speed Demon',
    description: 'Achieve 50 WPM',
    icon: '🏃',
    unlocked: false,
  },
  {
    id: 'wpm-80',
    title: 'Typing Master',
    description: 'Achieve 80 WPM',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'accuracy-95',
    title: 'Precision',
    description: 'Achieve 95% accuracy',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'accuracy-100',
    title: 'Perfect',
    description: 'Achieve 100% accuracy',
    icon: '💎',
    unlocked: false,
  },
  {
    id: 'daily-streak-3',
    title: 'Consistent',
    description: 'Complete tests for 3 consecutive days',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'daily-streak-7',
    title: 'Dedicated',
    description: 'Complete tests for 7 consecutive days',
    icon: '🌟',
    unlocked: false,
  },
];
