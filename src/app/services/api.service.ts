// src/app/services/api.service.ts
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://localhost:80/api/v1';
    private token: string | null = null;
    private userId: string | null = null;
    private role: string | null = null;
    private refreshTokenSubject = new BehaviorSubject<string | null>(null);

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.loadFromLocalStorage();
    }

    private loadFromLocalStorage(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.token = localStorage.getItem('access_token');
            this.userId = localStorage.getItem('user_id');
            if (this.token) {
                const decoded: any = jwtDecode(this.token);
                this.role = decoded.role;
            }
        }
    }

    setToken(token: string, userId: string): void {
        this.token = token;
        this.userId = userId;
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('access_token', token);
            localStorage.setItem('user_id', userId);
        }
        const decoded: any = jwtDecode(token);
        this.role = decoded.role;
    }

    getToken(): string | null {
        return this.token;
    }

    getUserId(): string | null {
        return this.userId;
    }

    getUserRole(): string | null {
        return this.role;
    }

    clearToken(): void {
        this.token = null;
        this.userId = null;
        this.role = null;
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
        }
    }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        });
    }

    private handle401Error(request: Observable<any>): Observable<any> {
        this.clearToken();
        return throwError(() => new Error('Session expired, please log in again'));
    }

    login(credentials: { email: string; password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/login`, credentials, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true
        }).pipe(
            catchError((err: HttpErrorResponse) => {
                return throwError(() => err);
            })
        );
    }

    signup(user: { email: string; password: string; role: string; first_name: string; last_name: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/register`, user, {
            headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
            withCredentials: true
        }).pipe(
            catchError((err: HttpErrorResponse) => {
                return throwError(() => err);
            })
        );
    }

    getJobs(): Observable<any> {
        const request = this.http.get(`${this.apiUrl}/jobs`, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }

    getRecommendedJobs(): Observable<any> {
        const request = this.http.get(`${this.apiUrl}/jobs/recommended`, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }

    getInterviews(userId: string): Observable<any> {
        const request = this.http.get(`${this.apiUrl}/interviews/${userId}`, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }

    applyToJob(jobId: string): Observable<any> {
        const request = this.http.post(`${this.apiUrl}/applications/apply/${jobId}`, {}, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }

    addSkills(skills: string[]): Observable<any> {
        const request = this.http.post(`${this.apiUrl}/users/skills`, { skills }, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }

    postJob(job: { title: string; description: string; location: string; skills: string[] }): Observable<any> {
        const request = this.http.post(`${this.apiUrl}/jobs`, job, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }
}