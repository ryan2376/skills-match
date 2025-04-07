import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LandingPageComponent } from './landing-page/landing-page.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent }, // Default route
  { path: 'for-job-seekers', component: LandingPageComponent }, // Placeholder
  { path: 'for-employers', component: LandingPageComponent }, // Placeholder
  { path: 'login', component: LandingPageComponent }, // Placeholder
  { path: 'signup', component: LandingPageComponent }, // Placeholder
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations() // Required for Angular Material animations
  ]
};