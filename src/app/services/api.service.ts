// src/app/services/api.service.ts
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

// Define an interface for the decoded JWT token
interface DecodedToken {
  role?: string; // Role might be optional depending on your JWT structure
  [key: string]: any; // Allow other properties
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://13.49.224.93//api/v1';
    private token: string | null = null;
    private userId: string | null = null;
    private role: string | null = null;

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
                const decoded: DecodedToken = jwtDecode(this.token);
                this.role = decoded.role || null; // Safely assign role, default to null if undefined
            }
        }
    }

    setAuthInfo(token: string, userId: string): void {
        this.token = token;
        this.userId = userId;
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('access_token', token);
            localStorage.setItem('user_id', userId);
        }
        const decoded: DecodedToken = jwtDecode(token);
        this.role = decoded.role || null; // Safely assign role, default to null if undefined
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('userRole', this.role || '');
        }
    }

    clearAuthInfo(): void {
        this.token = null;
        this.userId = null;
        this.role = null;
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('userRole');
        }
    }

    getToken(): string | null {
        // Ensure we don't try to access localStorage in a non-browser environment
        if (isPlatformBrowser(this.platformId)) {
            return this.token || localStorage.getItem('access_token');
        }
        return this.token; // Return the in-memory token if not in a browser
    }

    getUserId(): string | null {
        // Ensure we don't try to access localStorage in a non-browser environment
        if (isPlatformBrowser(this.platformId)) {
            return this.userId || localStorage.getItem('user_id');
        }
        return this.userId; // Return the in-memory userId if not in a browser
    }

    getUserRole(): string | null {
        // Ensure we don't try to access localStorage in a non-browser environment
        if (isPlatformBrowser(this.platformId)) {
            return this.role || localStorage.getItem('userRole');
        }
        return this.role; // Return the in-memory role if not in a browser
    }

    private getHeaders(): HttpHeaders {
        const token = this.getToken();
        let headers = new HttpHeaders().set('Content-Type', 'application/json');
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }

    private handle401Error(request: Observable<any>): Observable<any> {
        this.clearAuthInfo();
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

    getJobById(jobId: string): Observable<any> {
        const request = this.http.get(`${this.apiUrl}/jobs/${jobId}`, { headers: this.getHeaders() });
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

 // src/app/services/api.service.ts
getInterviewsForEmployer(userId: string): Observable<any> {
    const request = this.http.get(`${this.apiUrl}/interviews/employer/${userId}`, { headers: this.getHeaders() });
    return request.pipe(
        catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
                return this.handle401Error(request);
            }
            return throwError(() => err);
        })
    );
}

getInterviewsForJobSeeker(userId: string): Observable<any> {
    const request = this.http.get(`${this.apiUrl}/interviews/job-seeker/${userId}`, { headers: this.getHeaders() });
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
        const request = this.http.post(`${this.apiUrl}/applications/jobs/${jobId}/applications`, {}, { headers: this.getHeaders() });
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

    getJobsByEmployer(employerId: string): Observable<any> {
        const request = this.http.get(`${this.apiUrl}/jobs/employer/${employerId}`, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }

 // src/app/services/api.service.ts
getApplicationsForJob(jobId: string): Observable<any> {
    const request = this.http.get(`${this.apiUrl}/jobs/${jobId}/applications`, { headers: this.getHeaders() });
    return request.pipe(
        catchError((err: HttpErrorResponse) => {
            if (err.status === 401) {
                return this.handle401Error(request);
            }
            return throwError(() => err);
        })
    );
}

    updateJob(jobId: string, jobData: any): Observable<any> {
        const request = this.http.put(`${this.apiUrl}/jobs/${jobId}`, jobData, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }

    updateUserProfile(userId: string, userData: any): Observable<any> {
        const request = this.http.put(`${this.apiUrl}/users/${userId}`, userData, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }

    getApplicationById(applicationId: string): Observable<any> {
        const request = this.http.get(`${this.apiUrl}/${applicationId}`, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }

    updateApplicationStatus(applicationId: string, status: string): Observable<any> {
        const request = this.http.put(`${this.apiUrl}/${applicationId}/status`, { status }, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }

    getTotalUsers(): Observable<any> {
        const request = this.http.get(`${this.apiUrl}/users/total`, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }

    getUserById(userId: string): Observable<any> {
        const request = this.http.get(`${this.apiUrl}/users/${userId}`, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }
    
    getTotalJobs(): Observable<any> {
        const request = this.http.get(`${this.apiUrl}/jobs/total`, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }
    
    getTotalEmployers(): Observable<any> {
        const request = this.http.get(`${this.apiUrl}/users/employers/total`, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }
    
    getPendingReports(): Observable<any> {
        const request = this.http.get(`${this.apiUrl}/reports/pending`, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }
    
    getAllUsers(): Observable<any> {
        const request = this.http.get(`${this.apiUrl}/users`, { headers: this.getHeaders() });
        return request.pipe(
            catchError((err: HttpErrorResponse) => {
                if (err.status === 401) {
                    return this.handle401Error(request);
                }
                return throwError(() => err);
            })
        );
    }
    
    deleteUser(userId: string): Observable<any> {
        const request = this.http.delete(`${this.apiUrl}/users/${userId}`, { headers: this.getHeaders() });
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

