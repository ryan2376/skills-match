// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';

export const authGuard: CanActivateFn = (route, state) => {
    const apiService = inject(ApiService);
    const router = inject(Router);

    const token = apiService.getToken();
    const userId = apiService.getUserId();
    const userRole = apiService.getUserRole();

    // If there's no token or userId, redirect to login
    if (!token || !userId) {
        return router.createUrlTree(['/login']);
    }

    // If there's no user role, redirect to login (just to be safe)
    if (!userRole) {
        return router.createUrlTree(['/login']);
    }

    // Check if the route has a required role in its data
    const expectedRole = route.data['role'];

    // If the route requires a specific role and the user doesn't match, redirect to login
    if (expectedRole && userRole !== expectedRole) {
        return router.createUrlTree(['/login']);
    }

    // Allow access if all checks pass
    return true;
};