// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/Landing-page/landing-page.component';
import { SignupComponent } from './components/Sign-up/sign-up.component';
import { LoginComponent } from './components/Login/login.component';
import { AdminDashComponent } from './components/Admin/Admin-dash/admin-dash.component';
import { AdminUsersComponent } from './components/Admin/Users/users.component'; // New component
import { AdminJobsComponent } from './components/Admin/Jobs/jobs.component'; // New component
import { AdminSettingsComponent } from './components/Admin/Settings/settings.component'; // New component
import { UserDetailsComponent } from './components/Admin/User-details/user-details.component'; // New component
import { EditUserComponent } from './components/Admin/Edit-user/edit-user.component'; // New component
import { EmployerDashComponent } from './components/Employer/Employer-dash/employer-dash.component';
import { JobSeekerDashComponent } from './components/Job-seeker/Job-seeker-dash/job-seeker-dash.component';
import { PostAJobComponent } from './components/Post-a-job/post-a-job.component';
import { JobSeekerProfileComponent } from './components/Job-seeker/Job-seeker-profile/job-seeker-profile.component';
import { JobSeekerApplicationsComponent } from './components/Job-seeker/Job-seeker-applications/job-seeker-applications.component';
import { JobSeekerMatchesComponent } from './components/Job-seeker/Job-seeker-matches/job-seeker-matches.component';
import { JobSeekerSavedJobsComponent } from './components/Job-seeker/Job-seeker-saved-jobs/job-seeker-saved-jobs.component';
import { JobSeekerSettingsComponent } from './components/Job-seeker/Job-seeker-settings/job-seeker-settings.component';
import { JobDetailsComponent } from './components/Employer/Job-details/job-details.component';
import { EditJobComponent } from './components/Employer/Edit-job/edit-job.component';
import { CandidatesComponent } from './components/Employer/Candidates/candidates.component';
import { MatchesComponent } from './components/Employer/Matches/matches.component';
import { SettingsComponent } from './components/Employer/Settings/settings.component';
import { ApplicationDetailsComponent } from './components/Employer/ApplicationDetails/application-details.component';
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
            { path: 'users', component: AdminUsersComponent }, // New component for users list
            { path: 'jobs', component: AdminJobsComponent }, // New component for jobs list
            { path: 'settings', component: AdminSettingsComponent }, // New component for settings
            { path: 'user/:id', component: UserDetailsComponent }, // New route for user details
            { path: 'edit-user/:id', component: EditUserComponent }, // New route for editing user
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
            { path: 'candidates', component: CandidatesComponent },
            { path: 'matches', component: MatchesComponent },
            { path: 'settings', component: SettingsComponent },
            { path: 'job/:id', component: JobDetailsComponent },
            { path: 'edit-job/:id', component: EditJobComponent },
            { path: 'application/:applicationId', component: ApplicationDetailsComponent },
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