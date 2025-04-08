/* src/app/components/Admin-dash/admin-dash.component.ts */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../Navbar/navbar.component';

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
export class AdminDashComponent {
  // Mock data for overview cards
  overviewStats = [
    { title: 'Total Users', value: 1200 },
    { title: 'Total Jobs', value: 450 },
    { title: 'Active Employers', value: 80 },
    { title: 'Pending Reports', value: 15 }
  ];

  // Mock data for the table
  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'status', 'actions'];
  dataSource = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Job Seeker', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Employer', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Job Seeker', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Employer', status: 'Pending' }
  ];

  // Action handlers
  viewUser(user: any): void {
    console.log('View user:', user);
    // Add logic to navigate to user details page
  }

  editUser(user: any): void {
    console.log('Edit user:', user);
    // Add logic to open edit form
  }

  deleteUser(user: any): void {
    console.log('Delete user:', user);
    // Add logic to delete user
  }
}