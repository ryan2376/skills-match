// src/app/components/Job-seeker-applications/job-seeker-applications.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { NavbarComponent } from '../../Navbar/navbar.component';

@Component({
    selector: 'app-job-seeker-applications',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatTableModule,
        MatButtonModule,
        NavbarComponent
    ],
    templateUrl: './job-seeker-applications.component.html',
    styleUrls: ['./job-seeker-applications.component.css']
})
export class JobSeekerApplicationsComponent implements OnInit {
    userId: string | null = null;
    applications: any[] = [];
    displayedColumns: string[] = ['jobTitle', 'company', 'location', 'status', 'appliedDate'];
    error: string | null = null;

    constructor(private apiService: ApiService, private router: Router) {}

    ngOnInit(): void {
        this.userId = this.apiService.getUserId();
        if (!this.userId) {
            this.error = 'User not logged in';
            this.router.navigate(['/login']);
            return;
        }
        this.loadApplications();
    }

    loadApplications(): void {
        // Placeholder: In a real app, fetch applications from the backend
        // For now, we'll use mock data
        this.applications = [
            { jobTitle: 'Frontend Developer', company: 'Tech Corp', location: 'Remote', status: 'Applied', appliedDate: '2025-04-20' },
            { jobTitle: 'Full Stack Engineer', company: 'Innovate Inc', location: 'New York', status: 'Interview', appliedDate: '2025-04-18' }
        ];
        // Update the overview stats in the dashboard (if needed)
        // You might want to store this in a shared service or fetch it separately
    }

    logout(): void {
        this.apiService.clearAuthInfo();
        this.router.navigate(['/login']);
    }
}