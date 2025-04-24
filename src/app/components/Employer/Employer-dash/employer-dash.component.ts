// src/app/components/Employer-dash/employer-dash.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../Navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-employer-dash',
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
  templateUrl: './employer-dash.component.html',
  styleUrls: ['./employer-dash.component.css']
})
export class EmployerDashComponent implements OnInit {
  overviewStats = [
    { title: 'Posted Jobs', value: 0 },
    { title: 'Applications Received', value: 0 },
    { title: 'Matches Found', value: 0 },
    { title: 'Interviews Scheduled', value: 0 }
  ];

  displayedColumns: string[] = ['title', 'applications', 'matches', 'status', 'actions'];
  dataSource: any[] = [];
  error: string | null = null;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    const userId = this.apiService.getUserId();
    if (!userId) {
      this.error = 'User ID not found, please log in';
      this.router.navigate(['/login']);
      return;
    }

    // Verify user role
    const role = this.apiService.getUserRole();
    if (role !== 'employer') {
      this.error = 'Access denied: Only employers can access this dashboard';
      this.router.navigate(['/login']);
      return;
    }

    this.loadJobs(userId);
    this.loadInterviews(userId);
  }

  loadJobs(userId: string): void {
    this.apiService.getJobsByEmployer(userId).subscribe({
      next: (jobs) => {
        this.overviewStats[0].value = jobs.length; // Posted Jobs
        this.dataSource = jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          applications: 0, // Will be updated below
          matches: 0, // Will be updated below
          status: job.status.charAt(0).toUpperCase() + job.status.slice(1) // Capitalize status (e.g., 'open' -> 'Open')
        }));

        // Fetch applications for each job to calculate applications and matches
        let totalApplications = 0;
        let totalMatches = 0;

        this.dataSource.forEach((job, index) => {
          this.apiService.getApplicationsForJob(job.id).subscribe({
            next: (applications) => {
              const appCount = applications.length;
              const matchCount = applications.filter((app: any) => app.status === 'interview').length;

              this.dataSource[index].applications = appCount;
              this.dataSource[index].matches = matchCount;

              totalApplications += appCount;
              totalMatches += matchCount;

              this.overviewStats[1].value = totalApplications; // Applications Received
              this.overviewStats[2].value = totalMatches; // Matches Found
            },
            error: (err) => {
              this.error = err.message || 'Failed to load applications';
              console.error('Error loading applications for job:', err);
            }
          });
        });
      },
      error: (err) => {
        this.error = err.message || 'Failed to load jobs';
        console.error('Error loading jobs:', err);
      }
    });
  }

  loadInterviews(userId: string): void {
    this.apiService.getInterviews(userId).subscribe({
      next: (interviews) => {
        this.overviewStats[3].value = interviews.length; // Interviews Scheduled
      },
      error: (err) => {
        this.error = err.message || 'Failed to load interviews';
        console.error('Error loading interviews:', err);
      }
    });
  }

  viewJob(job: any): void {
    this.router.navigate(['/employer/job', job.id]); // Navigate to job details page (to be created)
  }

  editJob(job: any): void {
    this.router.navigate(['/employer/edit-job', job.id]); // Navigate to edit job page (to be created)
  }

  closeJob(job: any): void {
    if (job.status.toLowerCase() === 'closed') {
      this.error = 'Job is already closed';
      return;
    }

    const updatedJob = {
      title: job.title,
      description: job.description || '', // Provide default if not available
      location: job.location || '', // Provide default if not available
      status: 'closed'
    };

    this.apiService.updateJob(job.id, updatedJob).subscribe({
      next: (response) => {
        const index = this.dataSource.findIndex(j => j.id === job.id);
        if (index !== -1) {
          this.dataSource[index].status = 'Closed';
        }
      },
      error: (err) => {
        this.error = err.message || 'Failed to close job';
        console.error('Error closing job:', err);
      }
    });
  }
}