// src/app/components/Job-seeker-profile/job-seeker-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../Navbar/navbar.component';

@Component({
    selector: 'app-job-seeker-profile',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        NavbarComponent
    ],
    templateUrl: './job-seeker-profile.component.html',
    styleUrls: ['./job-seeker-profile.component.css']
})
export class JobSeekerProfileComponent implements OnInit {
    userId: string | null = null;
    profile: any = { firstName: '', lastName: '', email: '', skills: [] };
    error: string | null = null;
    success: string | null = null;
    loading: boolean = false;
    editMode: boolean = false;

    constructor(private apiService: ApiService, private router: Router) {}

    ngOnInit(): void {
        this.userId = this.apiService.getUserId();
        if (!this.userId) {
            this.error = 'User not logged in';
            this.router.navigate(['/login']);
            return;
        }
        this.loadProfile();
    }

    loadProfile(): void {
        // Placeholder: In a real app, fetch profile data from the backend
        // For now, we'll use mock data based on the logged-in user
        const email = 'jane.doe@example.com'; // This should come from the backend
        this.profile = {
            firstName: 'Jane',
            lastName: 'Doe',
            email: email,
            skills: ['JavaScript', 'Angular'] // This could be fetched from the backend
        };
    }

    toggleEditMode(): void {
        this.editMode = !this.editMode;
    }

    saveProfile(): void {
        if (!this.profile.firstName || !this.profile.lastName || !this.profile.email) {
            this.error = 'Please fill in all required fields';
            return;
        }

        this.loading = true;
        this.error = null;
        this.success = null;

        // Placeholder: In a real app, send updated profile data to the backend
        setTimeout(() => {
            this.loading = false;
            this.success = 'Profile updated successfully!';
            this.editMode = false;
        }, 1000);
    }

    logout(): void {
        this.apiService.clearToken();
        this.router.navigate(['/login']);
    }
}