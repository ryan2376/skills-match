// src/app/components/Login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../Navbar/navbar.component';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        RouterLink,
        NavbarComponent
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    loginForm: FormGroup;
    error: string | null = null;

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            rememberMe: [false]
        });
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            const { email, password } = this.loginForm.value;
            const credentials = { email, password }; // Create credentials object
            this.apiService.login(credentials).subscribe({
                next: (response) => {
                    console.log('Login response:', response);
                    this.apiService.setToken(response.access_token, response.user.id); // Pass both token and userId
                    console.log('Token set:', this.apiService.getToken());
                    console.log('User ID set:', this.apiService.getUserId());
                    const userRole = response.user.role;
                    if (userRole === 'job_seeker') {
                        this.router.navigate(['/job-seeker/dashboard']);
                    } else if (userRole === 'employer') {
                        this.router.navigate(['/employer/dashboard']);
                    } else if (userRole === 'admin') {
                        this.router.navigate(['/admin/dashboard']);
                    }
                },
                error: (err) => {
                    this.error = err.error.message || 'Login failed';
                    console.error('Login error:', err);
                }
            });
        }
    }
}