// src/app/components/job-seeker-dash/job-seeker-dash.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../Navbar/navbar.component';
import { ApiService } from '../../../services/api.service';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

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
        NavbarComponent,
        MatChipsModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
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
    recommendedJobs: any[] = []; // Added for recommended jobs
    error: string | null = null;
    skills: string[] = [];
    success: string | null = null;
    loading: boolean = false;
    newSkill: string = '';

    constructor(private apiService: ApiService, private router: Router) {}

    ngOnInit(): void {
        const userId = this.apiService.getUserId();
        if (!userId) {
            console.error('User ID not found, redirecting to login');
            this.router.navigate(['/login']);
            return;
        }
        this.loadJobs();
        this.loadRecommendedJobs(); // Added to load recommended jobs
        this.loadInterviews(userId);
    }

    loadJobs(): void {
        this.apiService.getJobs().subscribe({
            next: (response) => {
                this.jobs = response.filter((job: any) => job.status === 'open');
                console.log('Loaded jobs:', this.jobs);
            },
            error: (err) => {
                this.error = err.error.message || 'Failed to load jobs';
                console.error('Error loading jobs:', err);
            }
        });
    }
    
    loadRecommendedJobs(): void {
        this.apiService.getRecommendedJobs().subscribe({
            next: (response) => {
                this.recommendedJobs = response || [];
                this.overviewStats[1].value = this.recommendedJobs.length;
                console.log('Loaded recommended jobs:', this.recommendedJobs);
            },
            error: (err) => {
                this.error = err.error.message || 'Failed to load recommended jobs';
                this.recommendedJobs = []; // Reset on error
                this.overviewStats[1].value = 0;
                console.error('Error loading recommended jobs:', err);
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
        // Validate job ID before calling the API
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (!job || !job.id || !uuidRegex.test(job.id)) {
            this.error = 'Invalid job ID: cannot apply to this job';
            console.error('Invalid job ID:', job?.id);
            return;
        }
    
        this.apiService.applyToJob(job.id).subscribe({
            next: () => {
                alert('Application submitted successfully!');
                this.loadJobs();
                this.loadRecommendedJobs();
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

    addSkill(): void {
        const skill = this.newSkill.trim();
        if (skill && !this.skills.includes(skill)) {
            this.skills.push(skill);
            this.newSkill = '';
        }
    }

    removeSkill(skill: string): void {
        this.skills = this.skills.filter((s) => s !== skill);
    }

    submitSkills(): void {
        if (this.skills.length === 0) {
            this.error = 'Please add at least one skill';
            return;
        }

        this.loading = true;
        this.error = null;
        this.success = null;

        this.apiService.addSkills(this.skills).subscribe({
            next: (response) => {
                this.success = response.message || 'Skills added successfully!';
                this.loading = false;
                this.skills = [];
                this.loadRecommendedJobs(); // Refresh recommended jobs after adding skills
            },
            error: (err) => {
                this.error = err.error.message || 'Failed to add skills';
                this.loading = false;
                console.error('Error adding skills:', err);
            },
        });
    }
}