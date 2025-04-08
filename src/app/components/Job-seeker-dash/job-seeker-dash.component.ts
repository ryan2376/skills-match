/* src/app/components/Job-seeker-dash/job-seeker-dash.component.ts */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../Navbar/navbar.component';

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
export class JobSeekerDashComponent {
  // Mock data for overview cards
  overviewStats = [
    { title: 'Applications Sent', value: 35 },
    { title: 'Matches Found', value: 12 },
    { title: 'Interviews Scheduled', value: 5 },
    { title: 'Saved Jobs', value: 8 }
  ];

  // Mock data for the table (job applications)
  displayedColumns: string[] = ['title', 'company', 'status', 'matchScore', 'actions'];
  dataSource = [
    { title: 'Software Engineer', company: 'Tech Corp', status: 'Applied', matchScore: 85 },
    { title: 'Product Manager', company: 'Innovate Inc', status: 'Interview', matchScore: 90 },
    { title: 'UI/UX Designer', company: 'Design Co', status: 'Rejected', matchScore: 70 },
    { title: 'Data Analyst', company: 'Data Solutions', status: 'Applied', matchScore: 80 }
  ];

  // Action handlers
  viewJob(job: any): void {
    console.log('View job:', job);
    // Add logic to navigate to job details page
  }

  withdrawApplication(job: any): void {
    console.log('Withdraw application:', job);
    // Add logic to withdraw application
  }

  saveJob(job: any): void {
    console.log('Save job:', job);
    // Add logic to save job
  }
}