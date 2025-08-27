import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TypingTestComponent } from './components/typing-test/typing-test.component';
import { ResultsComponent } from './components/results/results.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'test', component: TypingTestComponent },
  { path: 'results', component: ResultsComponent },
  { path: '**', redirectTo: '' },
];
