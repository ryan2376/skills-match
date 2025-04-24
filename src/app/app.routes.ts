// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/Landing-page/landing-page.component';
import { SignupComponent } from './components/Sign-up/sign-up.component';
import { LoginComponent } from './components/Login/login.component';
import { AdminDashComponent } from './components/Admin-dash/admin-dash.component';
import { EmployerDashComponent } from './components/Employer-dash/employer-dash.component';
import { JobSeekerDashComponent } from './components/Job-seeker/Job-seeker-dash/job-seeker-dash.component';
import { PostAJobComponent } from './components/Post-a-job/post-a-job.component';
import { JobSeekerProfileComponent } from './components/Job-seeker/Job-seeker-profile/job-seeker-profile.component';
import { JobSeekerApplicationsComponent } from './components/Job-seeker/Job-seeker-applications/job-seeker-applications.component';
import { JobSeekerMatchesComponent } from './components/Job-seeker/Job-seeker-matches/job-seeker-matches.component';
import { JobSeekerSavedJobsComponent } from './components/Job-seeker/Job-seeker-saved-jobs/job-seeker-saved-jobs.component';
import { JobSeekerSettingsComponent } from './components/Job-seeker/Job-seeker-settings/job-seeker-settings.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'for-job-seekers', component: JobSeekerDashComponent },
    { path: 'for-employers', component: EmployerDashComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    {
        path: 'admin',
        canActivate: [authGuard],
        data: { role: 'admin' },
        children: [
            { path: 'dashboard', component: AdminDashComponent },
            { path: 'users', component: AdminDashComponent },
            { path: 'jobs', component: AdminDashComponent },
            { path: 'reports', component: AdminDashComponent },
            { path: 'settings', component: AdminDashComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
    },
    {
        path: 'employer',
        canActivate: [authGuard],
        data: { role: 'employer' },
        children: [
            { path: 'dashboard', component: EmployerDashComponent },
            { path: 'post-job', component: PostAJobComponent },
            { path: 'candidates', component: EmployerDashComponent },
            { path: 'matches', component: EmployerDashComponent },
            { path: 'settings', component: EmployerDashComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
    },
    {
        path: 'job-seeker',
        canActivate: [authGuard],
        data: { role: 'job_seeker' },
        children: [
            { path: 'dashboard', component: JobSeekerDashComponent },
            { path: 'profile', component: JobSeekerProfileComponent },
            { path: 'applications', component: JobSeekerApplicationsComponent },
            { path: 'matches', component: JobSeekerMatchesComponent },
            { path: 'saved-jobs', component: JobSeekerSavedJobsComponent },
            { path: 'settings', component: JobSeekerSettingsComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
    },
    { path: '**', redirectTo: '' },
];