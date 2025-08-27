import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PersonalBest, Achievement, ACHIEVEMENTS } from '../models/typing-test.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly PERSONAL_BESTS_KEY = 'nexitype_personal_bests';
  private readonly ACHIEVEMENTS_KEY = 'nexitype_achievements';
  private readonly THEME_KEY = 'nexitype_theme';
  private readonly DAILY_STREAK_KEY = 'nexitype_daily_streak';
  private readonly LAST_TEST_DATE_KEY = 'nexitype_last_test_date';

  private themeSubject = new BehaviorSubject<'light' | 'dark'>('light');
  private achievementsSubject = new BehaviorSubject<Achievement[]>(ACHIEVEMENTS);

  public theme$ = this.themeSubject.asObservable();
  public achievements$ = this.achievementsSubject.asObservable();

  constructor() {
    this.loadTheme();
    this.loadAchievements();
  }

  // Theme Management
  setTheme(theme: 'light' | 'dark'): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.THEME_KEY, theme);
    }
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  getTheme(): 'light' | 'dark' {
    return this.themeSubject.value;
  }

  private loadTheme(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedTheme = localStorage.getItem(this.THEME_KEY) as 'light' | 'dark';
      const theme = savedTheme || 'light';
      this.themeSubject.next(theme);
      this.applyTheme(theme);
    } else {
      // Default theme for server-side rendering
      this.themeSubject.next('light');
      this.applyTheme('light');
    }
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    if (typeof window !== 'undefined' && window.document) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  // Personal Bests Management
  savePersonalBest(result: PersonalBest): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    const personalBests = this.getPersonalBests();
    const existingIndex = personalBests.findIndex(pb => pb.duration === result.duration);

    if (existingIndex >= 0) {
      if (result.wpm > personalBests[existingIndex].wpm) {
        personalBests[existingIndex] = result;
      }
    } else {
      personalBests.push(result);
    }

    localStorage.setItem(this.PERSONAL_BESTS_KEY, JSON.stringify(personalBests));
  }

  getPersonalBests(): PersonalBest[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];

    const saved = localStorage.getItem(this.PERSONAL_BESTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((pb: any) => ({
        ...pb,
        date: new Date(pb.date),
      }));
    }
    return [];
  }

  getPersonalBestForDuration(duration: number): PersonalBest | null {
    const personalBests = this.getPersonalBests();
    return personalBests.find(pb => pb.duration === duration) || null;
  }

  // Achievements Management
  unlockAchievement(achievementId: string): void {
    const achievements = this.achievementsSubject.value;
    const achievement = achievements.find(a => a.id === achievementId);

    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedDate = new Date();
      this.achievementsSubject.next([...achievements]);
      this.saveAchievements(achievements);
    }
  }

  private loadAchievements(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    const saved = localStorage.getItem(this.ACHIEVEMENTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const achievements = parsed.map((a: any) => ({
        ...a,
        unlockedDate: a.unlockedDate ? new Date(a.unlockedDate) : undefined,
      }));
      this.achievementsSubject.next(achievements);
    }
  }

  private saveAchievements(achievements: Achievement[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.ACHIEVEMENTS_KEY, JSON.stringify(achievements));
    }
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievementsSubject.value.filter(a => a.unlocked);
  }

  // Daily Streak Management
  updateDailyStreak(): number {
    if (typeof window === 'undefined' || !window.localStorage) return 0;

    const today = new Date().toDateString();
    const lastTestDate = localStorage.getItem(this.LAST_TEST_DATE_KEY);
    const currentStreak = parseInt(localStorage.getItem(this.DAILY_STREAK_KEY) || '0');

    if (lastTestDate === today) {
      return currentStreak; // Already tested today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    let newStreak = 1; // At least 1 for today

    if (lastTestDate === yesterdayString) {
      newStreak = currentStreak + 1; // Consecutive day
    }

    localStorage.setItem(this.LAST_TEST_DATE_KEY, today);
    localStorage.setItem(this.DAILY_STREAK_KEY, newStreak.toString());

    return newStreak;
  }

  getCurrentStreak(): number {
    if (typeof window === 'undefined' || !window.localStorage) return 0;
    return parseInt(localStorage.getItem(this.DAILY_STREAK_KEY) || '0');
  }

  // Check and unlock achievements based on results
  checkAchievements(wpm: number, accuracy: number): void {
    // WPM achievements
    if (wpm >= 30) this.unlockAchievement('wpm-30');
    if (wpm >= 50) this.unlockAchievement('wpm-50');
    if (wpm >= 80) this.unlockAchievement('wpm-80');

    // Accuracy achievements
    if (accuracy >= 95) this.unlockAchievement('accuracy-95');
    if (accuracy === 100) this.unlockAchievement('accuracy-100');

    // First test achievement
    const personalBests = this.getPersonalBests();
    if (personalBests.length === 1) {
      this.unlockAchievement('first-test');
    }

    // Daily streak achievements
    const streak = this.getCurrentStreak();
    if (streak >= 3) this.unlockAchievement('daily-streak-3');
    if (streak >= 7) this.unlockAchievement('daily-streak-7');
  }

  // Clear all data (for testing/reset)
  clearAllData(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.PERSONAL_BESTS_KEY);
      localStorage.removeItem(this.ACHIEVEMENTS_KEY);
      localStorage.removeItem(this.DAILY_STREAK_KEY);
      localStorage.removeItem(this.LAST_TEST_DATE_KEY);
    }

    this.achievementsSubject.next(ACHIEVEMENTS);
  }
}
