// src/app/components/Employer/Settings/settings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../Navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    NavbarComponent
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  profileForm: FormGroup;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

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

    this.profileForm.patchValue({
      firstName: '',
      lastName: '',
      email: ''
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const userId = this.apiService.getUserId();
      if (!userId) {
        this.error = 'User ID not found';
        return;
      }

      const { firstName, lastName, email } = this.profileForm.value;
      const userData = {
        first_name: firstName,
        last_name: lastName,
        email: email
      };

      this.apiService.updateUserProfile(userId, userData).subscribe({
        next: () => {
          this.success = 'Profile updated successfully!';
          this.error = null;
        },
        error: (err) => {
          this.error = err.message || 'Failed to update profile';
          this.success = null;
          console.error('Error updating profile:', err);
        }
      });
    }
  }

  logout(): void {
    this.apiService.clearAuthInfo();
    this.router.navigate(['/login']);
  }
}