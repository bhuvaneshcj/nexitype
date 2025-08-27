import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import {
  TypingTestConfig,
  TypingResult,
  TypingStats,
} from '../models/typing-test.model';
import { getRandomText, getDailyChallenge } from '../data/typing-content';

@Injectable({
  providedIn: 'root',
})
export class TypingTestService {
  private testConfigSubject = new BehaviorSubject<TypingTestConfig | null>(null);
  private typingStatsSubject = new BehaviorSubject<TypingStats>({
    currentWordIndex: 0,
    currentCharIndex: 0,
    typedText: '',
    errors: [],
    isComplete: false,
  });
  private timeRemainingSubject = new BehaviorSubject<number>(0);
  private isTestActiveSubject = new BehaviorSubject<boolean>(false);

  public testConfig$ = this.testConfigSubject.asObservable();
  public typingStats$ = this.typingStatsSubject.asObservable();
  public timeRemaining$ = this.timeRemainingSubject.asObservable();
  public isTestActive$ = this.isTestActiveSubject.asObservable();

  private timerSubscription: any;

  constructor() {}

  startTest(duration: number, customText?: string): void {
    const text = customText || getRandomText();
    const config: TypingTestConfig = {
      duration,
      text,
      isCustomText: !!customText,
    };

    this.testConfigSubject.next(config);
    this.resetStats();
    this.startTimer(duration);
    this.isTestActiveSubject.next(true);
  }

  private startTimer(duration: number): void {
    this.timeRemainingSubject.next(duration);

    this.timerSubscription = timer(0, 1000)
      .pipe(takeWhile(() => this.timeRemainingSubject.value > 0))
      .subscribe(() => {
        const remaining = this.timeRemainingSubject.value - 1;
        this.timeRemainingSubject.next(remaining);

        if (remaining <= 0) {
          this.completeTest();
        }
      });
  }

  private resetStats(): void {
    const stats: TypingStats = {
      currentWordIndex: 0,
      currentCharIndex: 0,
      typedText: '',
      errors: [],
      isComplete: false,
      startTime: new Date(),
    };
    this.typingStatsSubject.next(stats);
  }

  processInput(input: string): void {
    if (!this.isTestActiveSubject.value) return;

    const config = this.testConfigSubject.value;
    if (!config) return;

    const currentStats = this.typingStatsSubject.value;
    const words = config.text.split(' ');
    const currentWord = words[currentStats.currentWordIndex];

    if (input === ' ') {
      // Move to next word
      if (currentStats.currentCharIndex === currentWord.length) {
        const newStats = {
          ...currentStats,
          currentWordIndex: currentStats.currentWordIndex + 1,
          currentCharIndex: 0,
          typedText: currentStats.typedText + ' ',
        };
        this.typingStatsSubject.next(newStats);
      }
    } else if (input === 'Backspace') {
      // Handle backspace
      if (currentStats.currentCharIndex > 0) {
        const newStats = {
          ...currentStats,
          currentCharIndex: currentStats.currentCharIndex - 1,
          typedText: currentStats.typedText.slice(0, -1),
        };
        this.typingStatsSubject.next(newStats);
      }
    } else if (input.length === 1) {
      // Handle character input
      const expectedChar = currentWord[currentStats.currentCharIndex];
      const isCorrect = input === expectedChar;

      const newStats = {
        ...currentStats,
        currentCharIndex: currentStats.currentCharIndex + 1,
        typedText: currentStats.typedText + input,
        errors: isCorrect
          ? currentStats.errors
          : [...currentStats.errors, currentStats.typedText.length],
      };

      this.typingStatsSubject.next(newStats);

      // Check if word is complete
      if (newStats.currentCharIndex === currentWord.length) {
        // Word completed, check if test is complete
        if (newStats.currentWordIndex === words.length - 1) {
          this.completeTest();
        }
      }
    }
  }

  private completeTest(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    const stats = this.typingStatsSubject.value;
    const config = this.testConfigSubject.value;

    if (config && stats.startTime) {
      const endTime = new Date();
      const timeElapsed = (endTime.getTime() - stats.startTime.getTime()) / 1000;

      const result = this.calculateResults(stats, config, timeElapsed);
      this.isTestActiveSubject.next(false);

      // Update stats with completion
      const finalStats = {
        ...stats,
        isComplete: true,
        endTime,
      };
      this.typingStatsSubject.next(finalStats);
    }
  }

  private calculateResults(
    stats: TypingStats,
    config: TypingTestConfig,
    timeElapsed: number
  ): TypingResult {
    const words = config.text.split(' ');
    const totalWords = words.length;
    const totalCharacters = stats.typedText.length;
    const errors = stats.errors.length;

    // Calculate WPM (words per minute)
    const minutes = timeElapsed / 60;
    const wpm = minutes > 0 ? Math.round(totalWords / minutes) : 0;

    // Calculate accuracy
    const accuracy =
      totalCharacters > 0 ? Math.round(((totalCharacters - errors) / totalCharacters) * 100) : 100;

    return {
      wpm,
      accuracy,
      totalCharacters,
      errors,
      timeElapsed,
      date: new Date(),
    };
  }

  getCurrentResult(): TypingResult | null {
    const stats = this.typingStatsSubject.value;
    const config = this.testConfigSubject.value;

    if (!config || !stats.startTime) return null;

    const timeElapsed =
      stats.isComplete && stats.endTime
        ? (stats.endTime.getTime() - stats.startTime.getTime()) / 1000
        : (new Date().getTime() - stats.startTime.getTime()) / 1000;

    return this.calculateResults(stats, config, timeElapsed);
  }

  stopTest(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.isTestActiveSubject.next(false);
  }

  resetTest(): void {
    this.stopTest();
    this.testConfigSubject.next(null);
    this.typingStatsSubject.next({
      currentWordIndex: 0,
      currentCharIndex: 0,
      typedText: '',
      errors: [],
      isComplete: false,
    });
    this.timeRemainingSubject.next(0);
  }

  getDailyChallenge(): string {
    return getDailyChallenge();
  }


}
