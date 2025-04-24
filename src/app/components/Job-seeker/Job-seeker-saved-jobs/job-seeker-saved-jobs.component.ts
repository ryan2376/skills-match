// src/app/components/Job-seeker-saved-jobs/job-seeker-saved-jobs.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../../Navbar/navbar.component';

@Component({
    selector: 'app-job-seeker-saved-jobs',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        NavbarComponent
    ],
    templateUrl: './job-seeker-saved-jobs.component.html',
    styleUrls: ['./job-seeker-saved-jobs.component.css']
})
export class JobSeekerSavedJobsComponent implements OnInit {
    userId: string | null = null;
    savedJobs: any[] = [];
    displayedColumns: string[] = ['title', 'company', 'location', 'status', 'actions'];
    error: string | null = null;

    constructor(private apiService: ApiService, private router: Router) {}

    ngOnInit(): void {
        this.userId = this.apiService.getUserId();
        if (!this.userId) {
            this.error = 'User not logged in';
            this.router.navigate(['/login']);
            return;
        }
        this.loadSavedJobs();
    }

    loadSavedJobs(): void {
        // Placeholder: In a real app, fetch saved jobs from the backend
        // For now, we'll use mock data
        this.savedJobs = [
            { id: '1', title: 'UI Designer', company: 'Design Co', location: 'Remote', status: 'open' },
            { id: '2', title: 'Backend Developer', company: 'Server Solutions', location: 'New York', status: 'open' }
        ];
        // TODO: Add an API call in ApiService, e.g., this.apiService.getSavedJobs()
    }

    applyToJob(job: any): void {
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (!job || !job.id || !uuidRegex.test(job.id)) {
            this.error = 'Invalid job ID: cannot apply to this job';
            console.error('Invalid job ID:', job?.id);
            return;
        }

        this.apiService.applyToJob(job.id).subscribe({
            next: () => {
                alert('Application submitted successfully!');
                this.loadSavedJobs(); // Refresh the list
            },
            error: (err) => {
                this.error = err.error.message || 'Failed to apply to job';
                console.error('Error applying to job:', err);
            }
        });
    }

    removeSavedJob(job: any): void {
        // Placeholder: In a real app, call an API to remove the job from saved jobs
        this.savedJobs = this.savedJobs.filter(j => j.id !== job.id);
        alert('Job removed from saved jobs!');
        // TODO: Add an API call in ApiService, e.g., this.apiService.removeSavedJob(job.id)
    }

    logout(): void {
        this.apiService.clearToken();
        this.router.navigate(['/login']);
    }
}