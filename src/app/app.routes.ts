/* src/app/app.routes.ts */
import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/Landing-page/landing-page.component';
import { SignupComponent } from './components/Sign-up/sign-up.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'for-job-seekers', component: LandingPageComponent },
    { path: 'for-employers', component: LandingPageComponent },
    { path: 'login', component: LandingPageComponent },
    { path: 'signup', component: SignupComponent },
];