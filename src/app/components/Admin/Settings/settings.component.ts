// src/app/components/Admin/settings/settings.component.ts
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../Navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
    selector: 'app-admin-settings',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent
    ],
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css']
})
export class AdminSettingsComponent {
    constructor(private apiService: ApiService, private router: Router) {}

    logout(): void {
        this.apiService.clearAuthInfo();
        this.router.navigate(['/login']);
    }
}