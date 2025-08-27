import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TypingTestService } from '../../services/typing-test.service';
import { StorageService } from '../../services/storage.service';
import { TypingTestConfig, TypingStats, TypingResult } from '../../models/typing-test.model';

@Component({
  selector: 'app-typing-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './typing-test.component.html',
  styleUrls: ['./typing-test.component.css'],
})
export class TypingTestComponent implements OnInit, OnDestroy {
  testConfig: TypingTestConfig | null = null;
  typingStats: TypingStats | null = null;
  timeRemaining: number = 0;
  isTestActive: boolean = false;
  currentResult: TypingResult | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private typingTestService: TypingTestService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.typingTestService.testConfig$.subscribe(config => {
        this.testConfig = config;
        if (!config) {
          this.router.navigate(['/']);
        }
      }),
      this.typingTestService.typingStats$.subscribe(stats => {
        this.typingStats = stats;
        if (stats.isComplete) {
          this.handleTestComplete();
        }
      }),
      this.typingTestService.timeRemaining$.subscribe(time => {
        this.timeRemaining = time;
      }),
      this.typingTestService.isTestActive$.subscribe(active => {
        this.isTestActive = active;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isTestActive || !this.testConfig) return;

    // Prevent default for most keys during test
    if (event.key !== 'Tab' && event.key !== 'Escape') {
      event.preventDefault();
    }

    // Handle special keys
    if (event.key === 'Escape') {
      this.stopTest();
      return;
    }

    if (event.key === 'Backspace') {
      this.typingTestService.processInput('Backspace');
      return;
    }

    if (event.key === ' ') {
      this.typingTestService.processInput(' ');
      return;
    }

    // Handle regular character input
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      this.typingTestService.processInput(event.key);
    }
  }

  private handleTestComplete(): void {
    const result = this.typingTestService.getCurrentResult();
    if (result) {
      this.currentResult = result;

      // Save personal best if applicable
      if (this.testConfig) {
        const personalBest = {
          wpm: result.wpm,
          accuracy: result.accuracy,
          date: result.date,
          duration: this.testConfig.duration,
        };
        this.storageService.savePersonalBest(personalBest);
      }

      // Update daily streak
      this.storageService.updateDailyStreak();

      // Check achievements
      this.storageService.checkAchievements(result.wpm, result.accuracy);

      // Navigate to results after a short delay
      setTimeout(() => {
        this.router.navigate(['/results']);
      }, 2000);
    }
  }

  stopTest(): void {
    this.typingTestService.stopTest();
    this.router.navigate(['/']);
  }

  getProgressPercentage(): number {
    if (!this.testConfig || !this.typingStats) return 0;

    const totalWords = this.testConfig.text.split(' ').length;
    const completedWords = this.typingStats.currentWordIndex;

    return Math.min((completedWords / totalWords) * 100, 100);
  }

  getTimeDisplay(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  getCurrentWPM(): number {
    if (!this.currentResult) return 0;
    return this.currentResult.wpm;
  }

  getCurrentAccuracy(): number {
    if (!this.currentResult) return 100;
    return this.currentResult.accuracy;
  }

  formatText(): { text: string[]; classes: string }[] {
    if (!this.testConfig || !this.typingStats) return [];

    const words = this.testConfig.text.split(' ');
    const result: { text: string[]; classes: string }[] = [];

    words.forEach((word, wordIndex) => {
      result.push({
        text: word.split(''),
        classes:
          wordIndex === this.typingStats!.currentWordIndex
            ? 'bg-blue-50 dark:bg-blue-900/20 rounded px-1'
            : '',
      });
    });

    return result;
  }

  getCharClass(wordIndex: number, charIndex: number): string {
    if (!this.testConfig || !this.typingStats) return 'text-gray-400 dark:text-gray-500';

    const words = this.testConfig.text.split(' ');
    const currentWord = words[wordIndex];
    const globalCharIndex = this.getGlobalCharIndex(wordIndex, charIndex);

    if (wordIndex < this.typingStats.currentWordIndex) {
      // Completed word
      return 'text-green-600 dark:text-green-400';
    } else if (wordIndex === this.typingStats.currentWordIndex) {
      // Current word
      if (charIndex < this.typingStats.currentCharIndex) {
        // Typed character
        const isError = this.typingStats.errors.includes(globalCharIndex);
        return isError
          ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
          : 'text-green-600 dark:text-green-400';
      } else if (charIndex === this.typingStats.currentCharIndex) {
        // Current character
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 font-bold';
      }
    }

    return 'text-gray-400 dark:text-gray-500';
  }

  private getGlobalCharIndex(wordIndex: number, charIndex: number): number {
    if (!this.testConfig) return 0;

    const words = this.testConfig.text.split(' ');
    let globalIndex = 0;

    for (let i = 0; i < wordIndex; i++) {
      globalIndex += words[i].length + 1; // +1 for space
    }

    return globalIndex + charIndex;
  }
}
