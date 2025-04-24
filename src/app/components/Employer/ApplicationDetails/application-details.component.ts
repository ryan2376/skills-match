// src/app/components/Employer/ApplicationDetails/application-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../Navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-application-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    RouterLink,
    NavbarComponent
  ],
  templateUrl: './application-details.component.html',
  styleUrls: ['./application-details.component.css']
})
export class ApplicationDetailsComponent implements OnInit {
  application: any = null;
  error: string | null = null;
  success: string | null = null;
  statusOptions: string[] = ['submitted', 'under_review', 'interview', 'accepted', 'rejected'];
  selectedStatus: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

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

    const applicationId = this.route.snapshot.paramMap.get('applicationId');
    if (!applicationId) {
      this.error = 'Application ID not found';
      this.router.navigate(['/employer/candidates']);
      return;
    }

    this.loadApplication(applicationId);
  }

  loadApplication(applicationId: string): void {
    this.apiService.getApplicationById(applicationId).subscribe({
      next: (app) => {
        this.application = app;
        this.selectedStatus = app.status;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load application details';
        console.error('Error loading application:', err);
        this.router.navigate(['/employer/candidates']);
      }
    });
  }

  updateStatus(): void {
    if (!this.selectedStatus) {
      this.error = 'Please select a status';
      return;
    }

    this.apiService.updateApplicationStatus(this.application.id, this.selectedStatus).subscribe({
      next: (updatedApp) => {
        this.application = updatedApp;
        this.success = 'Application status updated successfully!';
        this.error = null;
      },
      error: (err) => {
        this.error = err.message || 'Failed to update application status';
        this.success = null;
        console.error('Error updating status:', err);
      }
    });
  }

  logout(): void {
    this.apiService.clearAuthInfo();
    this.router.navigate(['/login']);
  }
}