// src/app/components/Admin/jobs/jobs.component.ts
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../Navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
    selector: 'app-admin-jobs',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent
    ],
    templateUrl: './jobs.component.html',
    styleUrls: ['./jobs.component.css']
})
export class AdminJobsComponent {
    constructor(private apiService: ApiService, private router: Router) {}

    logout(): void {
        this.apiService.clearAuthInfo();
        this.router.navigate(['/login']);
    }
}