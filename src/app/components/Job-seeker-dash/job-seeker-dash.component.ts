// src/app/components/Job-seeker-dash/job-seeker-dash.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../Navbar/navbar.component';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-job-seeker-dash',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatTableModule,
        MatIconModule,
        RouterLink,
        NavbarComponent
    ],
    templateUrl: './job-seeker-dash.component.html',
    styleUrls: ['./job-seeker-dash.component.css']
})
export class JobSeekerDashComponent implements OnInit {
    overviewStats = [
        { title: 'Applications Sent', value: 0 },
        { title: 'Matches Found', value: 0 },
        { title: 'Interviews Scheduled', value: 0 },
        { title: 'Saved Jobs', value: 0 }
    ];

    displayedColumns: string[] = ['title', 'company', 'location', 'status', 'actions'];
    jobs: any[] = [];
    error: string | null = null;

    constructor(private apiService: ApiService, private router: Router) {}

    ngOnInit(): void {
        const userId = this.apiService.getUserId();
        if (!userId) {
            console.error('User ID not found, redirecting to login');
            this.router.navigate(['/login']);
            return;
        }
        this.loadJobs();
        this.loadInterviews(userId);
    }

    loadJobs(): void {
        this.apiService.getJobs().subscribe({
            next: (response) => {
                this.jobs = response.filter((job: any) => job.status === 'open');
            },
            error: (err) => {
                this.error = err.error.message || 'Failed to load jobs';
                console.error('Error loading jobs:', err);
            }
        });
    }

    loadInterviews(userId: string): void {
        console.log('Fetching interviews for user:', userId);
        console.log('Token:', this.apiService.getToken());
        this.apiService.getInterviews(userId).subscribe({
            next: (response) => {
                console.log('Interviews response:', response);
                this.overviewStats[2].value = response.length;
            },
            error: (err) => {
                console.error('Error loading interviews:', err);
            }
        });
    }

    applyToJob(job: any): void {
        this.apiService.applyToJob(job.id).subscribe({
            next: () => {
                alert('Application submitted successfully!');
                this.loadJobs();
            },
            error: (err) => {
                this.error = err.error.message || 'Failed to apply to job';
                console.error('Error applying to job:', err);
            }
        });
    }

    logout(): void {
        this.apiService.clearToken();
        this.router.navigate(['/login']);
    }
}