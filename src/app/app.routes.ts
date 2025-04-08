/* src/app/app.routes.ts */
import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/Landing-page/landing-page.component';
import { SignupComponent } from './components/Sign-up/sign-up.component';
import { LoginComponent } from './components/Login/login.component';
import { AdminDashComponent } from './components/Admin-dash/admin-dash.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'for-job-seekers', component: LandingPageComponent },
    { path: 'for-employers', component: LandingPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'admin/dashboard', component: AdminDashComponent }, // Add admin dashboard route
    // Placeholder routes for sidebar links
    { path: 'admin/users', component: AdminDashComponent },
    { path: 'admin/jobs', component: AdminDashComponent },
    { path: 'admin/reports', component: AdminDashComponent },
    { path: 'admin/settings', component: AdminDashComponent }];