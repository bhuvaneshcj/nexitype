import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TypingTestService } from '../../services/typing-test.service';
import { StorageService } from '../../services/storage.service';
import { TypingResult, Achievement, PersonalBest } from '../../models/typing-test.model';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit, OnDestroy {
  result: TypingResult | null = null;
  isNewPersonalBest: boolean = false;
  unlockedAchievements: Achievement[] = [];
  personalBest: PersonalBest | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private typingTestService: TypingTestService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.result = this.typingTestService.getCurrentResult();

    if (!this.result) {
      this.router.navigate(['/']);
      return;
    }

    this.checkPersonalBest();
    this.loadAchievements();

    this.subscriptions.push(
      this.storageService.achievements$.subscribe(achievements => {
        this.unlockedAchievements = achievements.filter(a => a.unlocked);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private checkPersonalBest(): void {
    if (!this.result) return;

    const personalBests = this.storageService.getPersonalBests();
    const existingBest = personalBests.find(pb => pb.duration === this.result!.timeElapsed);

    if (!existingBest || this.result.wpm > existingBest.wpm) {
      this.isNewPersonalBest = true;
      this.personalBest = {
        wpm: this.result.wpm,
        accuracy: this.result.accuracy,
        date: this.result.date,
        duration: Math.round(this.result.timeElapsed),
      };
    } else {
      this.personalBest = existingBest;
    }
  }

  private loadAchievements(): void {
    this.unlockedAchievements = this.storageService.getUnlockedAchievements();
  }

  restartTest(): void {
    this.typingTestService.resetTest();
    this.router.navigate(['/']);
  }

  startNewTest(): void {
    this.typingTestService.resetTest();
    this.router.navigate(['/']);
  }

  getWPMColor(): string {
    if (!this.result) return 'text-gray-600 dark:text-gray-400';

    if (this.result.wpm >= 80) return 'text-purple-600 dark:text-purple-400';
    if (this.result.wpm >= 60) return 'text-blue-600 dark:text-blue-400';
    if (this.result.wpm >= 40) return 'text-green-600 dark:text-green-400';
    if (this.result.wpm >= 20) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }

  getAccuracyColor(): string {
    if (!this.result) return 'text-gray-600 dark:text-gray-400';

    if (this.result.accuracy >= 98) return 'text-green-600 dark:text-green-400';
    if (this.result.accuracy >= 95) return 'text-blue-600 dark:text-blue-400';
    if (this.result.accuracy >= 90) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  }

  getPerformanceMessage(): string {
    if (!this.result) return '';

    if (this.result.wpm >= 80 && this.result.accuracy >= 95) {
      return "Exceptional! You're a typing master! 🏆";
    } else if (this.result.wpm >= 60 && this.result.accuracy >= 90) {
      return "Great job! You're getting really fast! ⚡";
    } else if (this.result.wpm >= 40 && this.result.accuracy >= 85) {
      return 'Good progress! Keep practicing! 💪';
    } else if (this.result.wpm >= 20) {
      return 'Nice start! Practice makes perfect! 🌟';
    } else {
      return "Keep practicing! You'll get better! 📚";
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getNewAchievements(): Achievement[] {
    // This would need to be implemented to track newly unlocked achievements
    // For now, return all unlocked achievements
    return this.unlockedAchievements;
  }
}
