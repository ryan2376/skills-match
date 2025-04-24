// src/app/components/Employer/Matches/matches.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../Navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    RouterLink,
    NavbarComponent
  ],
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css']
})
export class MatchesComponent implements OnInit {
  displayedColumns: string[] = ['name', 'jobTitle', 'status', 'actions'];
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

    const role = this.apiService.getUserRole();
    if (role !== 'employer') {
      this.error = 'Access denied: Only employers can access this page';
      this.router.navigate(['/login']);
      return;
    }

    this.loadMatches(userId);
  }

  loadMatches(userId: string): void {
    this.apiService.getJobsByEmployer(userId).subscribe({
      next: (jobs) => {
        if (jobs.length === 0) {
          this.dataSource = [];
          return;
        }

        const matchPromises = jobs.map((job: any) =>
          this.apiService.getApplicationsForJob(job.id).toPromise().then(applications => {
            return applications
              .filter((app: any) => app.status === 'interview')
              .map((app: any) => ({
                applicationId: app.id,
                name: app.job_seeker_name || 'Unknown',
                jobTitle: job.title,
                jobId: job.id,
                status: app.status.charAt(0).toUpperCase() + app.status.slice(1)
              }));
          })
        );

        Promise.all(matchPromises).then(results => {
          this.dataSource = results.flat();
        }).catch(err => {
          this.error = err.message || 'Failed to load matches';
          console.error('Error loading matches:', err);
        });
      },
      error: (err) => {
        this.error = err.message || 'Failed to load jobs';
        console.error('Error loading jobs:', err);
      }
    });
  }

  viewApplication(application: any): void {
    this.router.navigate(['/employer/application', application.applicationId], {
      state: { jobId: application.jobId }
    });
  }

  logout(): void {
    this.apiService.clearAuthInfo();
    this.router.navigate(['/login']);
  }
}