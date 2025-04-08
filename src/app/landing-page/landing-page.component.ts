import { Component, OnInit, Renderer2, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [MatButtonModule, RouterLink, CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingPageComponent implements OnInit {
  isBrowser: boolean; // Add this property

  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Set the flag
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      const script = this.renderer.createElement('script');
      script.src = 'https://cdn.lordicon.com/lordicon.js';
      script.async = true;
      this.renderer.appendChild(document.body, script);
    }
  }
}