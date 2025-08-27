import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StorageService } from '../../services/storage.service';
import { TypingTestService } from '../../services/typing-test.service';
import { PersonalBest, Achievement, TEST_DURATIONS } from '../../models/typing-test.model';
import { getDailyChallenge } from '../../data/typing-content';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  personalBests: PersonalBest[] = [];
  unlockedAchievements: Achievement[] = [];
  currentStreak: number = 0;
  selectedDuration: number = 60;
  customText: string = '';
  showCustomTextInput: boolean = false;
  dailyChallenge: string = '';

  testDurations = TEST_DURATIONS;
  theme: 'light' | 'dark' = 'light';

  private subscriptions: Subscription[] = [];

  constructor(
    private storageService: StorageService,
    private typingTestService: TypingTestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.dailyChallenge = getDailyChallenge();

    this.subscriptions.push(
      this.storageService.theme$.subscribe(theme => {
        this.theme = theme;
      }),
      this.storageService.achievements$.subscribe(achievements => {
        this.unlockedAchievements = achievements.filter(a => a.unlocked);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadData(): void {
    this.personalBests = this.storageService.getPersonalBests();
    this.unlockedAchievements = this.storageService.getUnlockedAchievements();
    this.currentStreak = this.storageService.getCurrentStreak();
  }

  toggleTheme(): void {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.storageService.setTheme(newTheme);
  }

  startTest(): void {
    if (this.showCustomTextInput && this.customText.trim()) {
      this.typingTestService.startTest(this.selectedDuration, this.customText.trim());
    } else {
      this.typingTestService.startTest(this.selectedDuration);
    }
    this.router.navigate(['/test']);
  }

  startDailyChallenge(): void {
    this.typingTestService.startTest(60, this.dailyChallenge);
    this.router.navigate(['/test']);
  }

  toggleCustomTextInput(): void {
    this.showCustomTextInput = !this.showCustomTextInput;
    if (!this.showCustomTextInput) {
      this.customText = '';
    }
  }

  getPersonalBestForDuration(duration: number): PersonalBest | null {
    return this.personalBests.find(pb => pb.duration === duration) || null;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getDurationLabel(duration: number): string {
    const durationObj = this.testDurations.find(d => d.value === duration);
    return durationObj ? durationObj.label : `${duration}s`;
  }
}
