// src/app/components/Admin/users/users.component.ts
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../Navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent
    ],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})
export class AdminUsersComponent {
    constructor(private apiService: ApiService, private router: Router) {}

    logout(): void {
        this.apiService.clearAuthInfo();
        this.router.navigate(['/login']);
    }
}