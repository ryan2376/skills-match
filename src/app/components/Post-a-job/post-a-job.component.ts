/* src/app/components/Post-a-job/post-a-job.component.ts */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../Navbar/navbar.component';

@Component({
  selector: 'app-post-a-job',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    RouterLink,
    NavbarComponent
  ],
  templateUrl: './post-a-job.component.html',
  styleUrls: ['./post-a-job.component.css']
})
export class PostAJobComponent implements OnInit {
  jobForm: FormGroup;
  skills: string[] = []; // Array to store skills
  jobTypes: string[] = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'];

  constructor(private fb: FormBuilder) {
    this.jobForm = this.fb.group({
      jobTitle: ['', [Validators.required, Validators.minLength(3)]],
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      location: ['', [Validators.required]],
      jobType: ['', [Validators.required]],
      salaryRange: ['', []],
      description: ['', [Validators.required, Validators.minLength(10)]],
      requirements: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.jobForm.valid) {
      const jobData = {
        ...this.jobForm.value,
        skills: this.skills
      };
      console.log('Job Posted:', jobData);
      // Add logic to send jobData to backend API
    }
  }

  addSkill(event: any): void {
    const skill = event.target.value.trim();
    if (skill && !this.skills.includes(skill)) {
      this.skills.push(skill);
      event.target.value = '';
    }
  }

  removeSkill(skill: string): void {
    this.skills = this.skills.filter(s => s !== skill);
  }
}