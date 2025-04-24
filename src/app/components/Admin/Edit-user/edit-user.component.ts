// src/app/components/Admin/edit-user/edit-user.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NavbarComponent } from '../../Navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
    selector: 'app-edit-user',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        RouterLink,
        NavbarComponent
    ],
    templateUrl: './edit-user.component.html',
    styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
    user: any = null;
    error: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private apiService: ApiService
    ) {}

    ngOnInit(): void {
        const userId = this.route.snapshot.paramMap.get('id');
        if (!userId) {
            this.error = 'User ID not provided';
            return;
        }

        this.apiService.getUserById(userId).subscribe({
            next: (response) => {
                this.user = response;
            },
            error: (err) => {
                this.error = err.error.message || 'Failed to load user details';
                console.error('Error loading user details:', err);
            }
        });
    }

    onSubmit(): void {
        if (!this.user) return;

        this.apiService.updateUserProfile(this.user.id, {
            first_name: this.user.first_name,
            last_name: this.user.last_name,
            email: this.user.email,
            role: this.user.role,
        }).subscribe({
            next: () => {
                this.router.navigate(['/admin/dashboard']);
            },
            error: (err) => {
                this.error = err.error.message || 'Failed to update user';
                console.error('Error updating user:', err);
            }
        });
    }

    goBack(): void {
        this.router.navigate(['/admin/dashboard']);
    }

    logout(): void {
        this.apiService.clearAuthInfo();
        this.router.navigate(['/login']);
    }
}