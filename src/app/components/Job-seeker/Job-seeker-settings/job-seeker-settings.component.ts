// src/app/components/Job-seeker-settings/job-seeker-settings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../Navbar/navbar.component';

@Component({
    selector: 'app-job-seeker-settings',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatButtonModule,
        MatCheckboxModule,
        FormsModule,
        NavbarComponent
    ],
    templateUrl: './job-seeker-settings.component.html',
    styleUrls: ['./job-seeker-settings.component.css']
})
export class JobSeekerSettingsComponent implements OnInit {
    userId: string | null = null;
    settings: any = { emailNotifications: true, jobAlerts: true };
    error: string | null = null;
    success: string | null = null;
    loading: boolean = false;

    constructor(private apiService: ApiService, private router: Router) {}

    ngOnInit(): void {
        this.userId = this.apiService.getUserId();
        if (!this.userId) {
            this.error = 'User not logged in';
            this.router.navigate(['/login']);
            return;
        }
        this.loadSettings();
    }

    loadSettings(): void {
        // Placeholder: In a real app, fetch settings from the backend
        // For now, we'll use mock data
        this.settings = { emailNotifications: true, jobAlerts: true };
        // TODO: Add an API call in ApiService, e.g., this.apiService.getUserSettings()
    }

    saveSettings(): void {
        this.loading = true;
        this.error = null;
        this.success = null;

        // Placeholder: In a real app, send updated settings to the backend
        setTimeout(() => {
            this.loading = false;
            this.success = 'Settings updated successfully!';
        }, 1000);
        // TODO: Add an API call in ApiService, e.g., this.apiService.updateUserSettings(this.settings)
    }

    logout(): void {
        this.apiService.clearAuthInfo();
        this.router.navigate(['/login']);
    }
}