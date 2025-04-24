// src/app/components/Employer/Candidates/candidates.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../Navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatSelectModule,
    FormsModule,
    NavbarComponent
  ],
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.css']
})
export class CandidatesComponent implements OnInit {
  userId: string | null = null;
  jobs: any[] = [];
  selectedJob: any = null;
  applications: any[] = [];
  displayedColumns: string[] = ['job_seeker_name', 'status', 'applied_at', 'actions'];
  error: string | null = null;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.userId = this.apiService.getUserId();
    if (!this.userId) {
      this.error = 'User not logged in';
      this.router.navigate(['/login']);
      return;
    }

    const role = this.apiService.getUserRole();
    if (role !== 'employer') {
      this.error = 'Access denied: Only employers can access this page';
      this.router.navigate(['/login']);
      return;
    }

    this.loadJobs();
  }

  loadJobs(): void {
    this.apiService.getJobsByEmployer(this.userId!).subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        if (jobs.length > 0) {
          this.selectedJob = jobs[0];
          this.loadApplications(jobs[0].id);
        }
      },
      error: (err) => {
        this.error = err.message || 'Failed to load jobs';
        console.error('Error loading jobs:', err);
      }
    });
  }

  loadApplications(jobId: string): void {
    this.apiService.getApplicationsForJob(jobId).subscribe({
      next: (apps) => {
        this.applications = apps;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load applications';
        console.error('Error loading applications:', err);
      }
    });
  }

  onJobChange(job: any): void {
    this.selectedJob = job;
    this.loadApplications(job.id);
  }

  viewApplication(applicationId: string): void {
    this.router.navigate([`/employer/application/${applicationId}`]);
  }

  logout(): void {
    this.apiService.clearAuthInfo();
    this.router.navigate(['/login']);
  }
}