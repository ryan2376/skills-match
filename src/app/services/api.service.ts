// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://localhost:80/api/v1';
    private token: string | null = null;
    private userId: string | null = null; // Add this to store user ID
    private refreshInProgress = false;
    private retryQueue: Array<{ observable: Observable<any>, resolve: (value: any) => void, reject: (reason: any) => void }> = [];

    constructor(private http: HttpClient) {}

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('access_token', token);
    }

    setUserId(userId: string) { // Add method to store user ID
        this.userId = userId;
        localStorage.setItem('user_id', userId);
    }

    getToken(): string | null {
        if (!this.token) {
            this.token = localStorage.getItem('access_token');
        }
        return this.token;
    }

    getUserId(): string | null { // Add method to retrieve user ID
        if (!this.userId) {
            this.userId = localStorage.getItem('user_id');
        }
        return this.userId;
    }

    clearToken() {
        this.token = null;
        this.userId = null; // Clear user ID as well
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
    }

    private getHeaders(): HttpHeaders {
        let headers = new HttpHeaders();
        const token = this.getToken();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        console.log('Request headers:', headers);
        return headers;
    }

    private handle401Error(request: Observable<any>): Observable<any> {
        if (this.refreshInProgress) {
            return new Observable(observer => {
                this.retryQueue.push({
                    observable: request,
                    resolve: observer.next.bind(observer),
                    reject: observer.error.bind(observer)
                });
            });
        }

        this.refreshInProgress = true;
        return this.refreshToken().pipe(
            switchMap((response) => {
                this.setToken(response.access_token);
                this.refreshInProgress = false;

                this.retryQueue.forEach(item => {
                    item.observable.subscribe({
                        next: item.resolve,
                        error: item.reject
                    });
                });
                this.retryQueue = [];

                return request;
            }),
            catchError((err) => {
                this.refreshInProgress = false;
                this.retryQueue = [];
                this.clearToken();
                window.location.href = '/login';
                return throwError(() => err);
            })
        );
    }

    refreshToken(): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/refresh-token`, {}, { withCredentials: true });
    }

    login(email: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/login`, { email, password }, { withCredentials: true });
    }

    signup(name: string, email: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/register`, { first_name: name, email, password }, { withCredentials: true });
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

    postJob(jobData: any): Observable<any> {
        const request = this.http.post(`${this.apiUrl}/jobs`, jobData, { headers: this.getHeaders() });
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
}