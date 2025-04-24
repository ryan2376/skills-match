// src/app/components/Admin-dash/admin-dash.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../Navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-admin-dash',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    RouterLink,
    NavbarComponent
  ],
  templateUrl: './admin-dash.component.html',
  styleUrls: ['./admin-dash.component.css']
})
export class AdminDashComponent implements OnInit {
  overviewStats = [
    { title: 'Total Users', value: 0 },
    { title: 'Total Jobs', value: 0 },
    { title: 'Total Employers', value: 0 }
  ];

  displayedColumns: string[] = ['id', 'name', 'email', 'role','actions'];
  dataSource: any[] = [];
  error: string | null = null;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    const userId = this.apiService.getUserId();
    if (!userId) {
      this.error = 'User ID not found, please log in';
      this.router.navigate(['/login']);
      return;
    }

    const role = this.apiService.getUserRole();
    if (role !== 'admin') {
      this.error = 'Access denied: Only admins can access this dashboard';
      this.router.navigate(['/login']);
      return;
    }

    this.loadOverviewStats();
    this.loadUsers();
  }

  loadOverviewStats(): void {
    this.apiService.getTotalUsers().subscribe({
      next: (response) => {
        this.overviewStats[0].value = response.total;
      },
      error: (err) => {
        this.error = 'Failed to load total users.';
        console.error('Error loading total users:', err);
      }
    });

    this.apiService.getTotalJobs().subscribe({
      next: (response) => {
        this.overviewStats[1].value = response.total;
      },
      error: (err) => {
        this.error = 'Failed to load total jobs.';
        console.error('Error loading total jobs:', err);
      }
    });

    this.apiService.getTotalEmployers().subscribe({
      next: (response) => {
          this.overviewStats[2].value = response.total || 0;
      },
      error: (err) => {
          this.error = err.error?.message || 'Failed to load total employers';
          this.overviewStats[2].value = 0;
          console.error('Error loading total employers:', err);
      }
  });
}

  loadUsers(): void {
    this.apiService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource = users.map((user: any) => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        }));
      },
      error: (err) => {
        this.error = 'Failed to load users.';
        console.error('Error loading users:', err);
        this.dataSource = [];
      }
    });
  }

  viewUser(user: any): void {
    this.router.navigate(['/admin/user', user.id]);
  }

  editUser(user: any): void {
    this.router.navigate(['/admin/edit-user', user.id]);
  }

  deleteUser(user: any): void {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      this.apiService.deleteUser(user.id).subscribe({
        next: () => {
          this.dataSource = this.dataSource.filter(u => u.id !== user.id);
        },
        error: (err) => {
          this.error = 'Failed to delete user.';
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  logout(): void {
    this.apiService.clearAuthInfo();
    this.router.navigate(['/login']);
  }
}