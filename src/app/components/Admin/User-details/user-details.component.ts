// src/app/components/Admin/user-details/user-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NavbarComponent } from '../../Navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
    selector: 'app-user-details',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        RouterLink,
        NavbarComponent
    ],
    templateUrl: './user-details.component.html',
    styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
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

    goBack(): void {
        this.router.navigate(['/admin/dashboard']);
    }

    logout(): void {
        this.apiService.clearAuthInfo();
        this.router.navigate(['/login']);
    }
}