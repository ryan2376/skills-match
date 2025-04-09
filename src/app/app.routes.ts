/* src/app/app.routes.ts */
import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/Landing-page/landing-page.component';
import { SignupComponent } from './components/Sign-up/sign-up.component';
import { LoginComponent } from './components/Login/login.component';
import { AdminDashComponent } from './components/Admin-dash/admin-dash.component';
import { EmployerDashComponent } from './components/Employer-dash/employer-dash.component'; // Import EmployerDashComponent
import { JobSeekerDashComponent } from './components/Job-seeker-dash/job-seeker-dash.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'for-job-seekers', component: LandingPageComponent },
    { path: 'for-employers', component: LandingPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'admin/dashboard', component: AdminDashComponent },
    { path: 'admin/users', component: AdminDashComponent },
    { path: 'admin/jobs', component: AdminDashComponent },
    { path: 'admin/reports', component: AdminDashComponent },
    { path: 'admin/settings', component: AdminDashComponent },
    { path: 'employer/dashboard', component: EmployerDashComponent },
    { path: 'employer/post-job', component: EmployerDashComponent },
    { path: 'employer/candidates', component: EmployerDashComponent },
    { path: 'employer/matches', component: EmployerDashComponent },
    { path: 'employer/settings', component: EmployerDashComponent },
    { path: 'job-seeker/dashboard', component: JobSeekerDashComponent }, 
    { path: 'job-seeker/profile', component: JobSeekerDashComponent },
    { path: 'job-seeker/applications', component: JobSeekerDashComponent },
    { path: 'job-seeker/matches', component: JobSeekerDashComponent },
    { path: 'job-seeker/saved-jobs', component: JobSeekerDashComponent },
    { path: 'job-seeker/settings', component: JobSeekerDashComponent }
    ];