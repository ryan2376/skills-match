// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service'

export const authGuard: CanActivateFn = (route, state) => {
    const apiService = inject(ApiService);
    const router = inject(Router);

    const token = apiService.getToken();
    const userId = apiService.getUserId();

    if (!token || !userId) {
        router.navigate(['/login']);
        return false;
    }

    // Optionally, check user role based on the route
    const expectedRole = route.data['role'];
    const userRole = apiService.getUserRole(); // We'll add this method to ApiService
    if (expectedRole && userRole !== expectedRole) {
        router.navigate(['/login']);
        return false;
    }

    return true;
};