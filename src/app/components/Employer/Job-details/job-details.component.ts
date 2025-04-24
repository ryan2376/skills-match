// src/app/components/Employer/Job-details/job-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../Navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    RouterLink,
    NavbarComponent
  ],
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit {
  job: any = null;
  applications: number = 0;
  matches: number = 0;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id');
    if (!jobId) {
      this.error = 'Invalid job ID';
      return;
    }

    // Fetch job details
    this.apiService.getJobById(jobId).subscribe({
      next: (job) => {
        this.job = job;

        // Fetch applications for this job
        this.apiService.getApplicationsForJob(jobId).subscribe({
          next: (apps) => {
            this.applications = apps.length;
            this.matches = apps.filter((app: any) => app.status === 'interview').length;
          },
          error: (err) => {
            this.error = err.message || 'Failed to load applications';
            console.error('Error loading applications:', err);
          }
        });
      },
      error: (err) => {
        this.error = err.message || 'Failed to load job details';
        console.error('Error loading job:', err);
      }
    });
  }
}