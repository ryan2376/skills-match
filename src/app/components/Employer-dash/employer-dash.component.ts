/* src/app/components/Employer-dash/employer-dash.component.ts */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../Navbar/navbar.component';

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
export class EmployerDashComponent {
  // Mock data for overview cards
  overviewStats = [
    { title: 'Posted Jobs', value: 25 },
    { title: 'Applications Received', value: 150 },
    { title: 'Matches Found', value: 40 },
    { title: 'Interviews Scheduled', value: 10 }
  ];

  // Mock data for the table (job postings)
  displayedColumns: string[] = ['title', 'applications', 'matches', 'status', 'actions'];
  dataSource = [
    { title: 'Software Engineer', applications: 30, matches: 5, status: 'Open' },
    { title: 'Product Manager', applications: 20, matches: 3, status: 'Open' },
    { title: 'UI/UX Designer', applications: 15, matches: 2, status: 'Closed' },
    { title: 'Data Analyst', applications: 25, matches: 4, status: 'Open' }
  ];

  // Action handlers
  viewJob(job: any): void {
    console.log('View job:', job);
    // Add logic to navigate to job details page
  }

  editJob(job: any): void {
    console.log('Edit job:', job);
    // Add logic to open edit form
  }

  closeJob(job: any): void {
    console.log('Close job:', job);
    // Add logic to close job posting
  }
}