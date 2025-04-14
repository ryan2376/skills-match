/* src/app/components/landing-page/landing-page.component.ts */
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // Added for icons
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../Navbar/navbar.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule, // Added for icons
    RouterLink,
    NavbarComponent
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  // Method to handle button clicks (e.g., for analytics tracking)
  onGetStartedClick(role: string): void {
    console.log(`Get Started clicked for ${role}`);
    // Add analytics tracking or other logic here
  }
}