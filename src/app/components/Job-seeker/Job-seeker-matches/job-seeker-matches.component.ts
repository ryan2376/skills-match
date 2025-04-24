// src/app/components/Job-seeker-matches/job-seeker-matches.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../../Navbar/navbar.component';

@Component({
    selector: 'app-job-seeker-matches',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        NavbarComponent
    ],
    templateUrl: './job-seeker-matches.component.html',
    styleUrls: ['./job-seeker-matches.component.css']
})
export class JobSeekerMatchesComponent implements OnInit {
    userId: string | null = null;
    matches: any[] = [];
    displayedColumns: string[] = ['title', 'company', 'location', 'matchScore', 'actions'];
    error: string | null = null;

    constructor(private apiService: ApiService, private router: Router) {}

    ngOnInit(): void {
        this.userId = this.apiService.getUserId();
        if (!this.userId) {
            this.error = 'User not logged in';
            this.router.navigate(['/login']);
            return;
        }
        this.loadMatches();
    }

    loadMatches(): void {
        // Use the existing getRecommendedJobs method from ApiService
        this.apiService.getRecommendedJobs().subscribe({
            next: (response) => {
                this.matches = response.map((job: any) => ({
                    ...job,
                    matchScore: this.calculateMatchScore(job) // Placeholder for match score calculation
                }));
                console.log('Loaded matches:', this.matches);
            },
            error: (err) => {
                this.error = err.error.message || 'Failed to load job matches';
                console.error('Error loading matches:', err);
            }
        });
    }

    calculateMatchScore(job: any): number {
        // Placeholder: In a real app, this would be calculated based on skills, experience, etc.
        // For now, we'll return a random score between 70 and 100
        return Math.floor(Math.random() * (100 - 70 + 1)) + 70;
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
                this.loadMatches(); // Refresh the matches list
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