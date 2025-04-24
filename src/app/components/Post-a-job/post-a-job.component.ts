// src/app/components/Post-a-job/post-a-job.component.ts
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
import { ApiService } from '../../services/api.service';

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
    skills: string[] = [];
    error: string | null = null;
    success: string | null = null;

    constructor(private fb: FormBuilder, private apiService: ApiService) {
        this.jobForm = this.fb.group({
            jobTitle: ['', [Validators.required, Validators.minLength(3)]],
            location: ['', [Validators.required]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            requirements: ['', [Validators.required, Validators.minLength(10)]]
        });
    }

    ngOnInit(): void {}

    onSubmit(): void {
        if (this.jobForm.valid) {
            const { jobTitle, location, description, requirements } = this.jobForm.value;
            const combinedDescription = `${description}\n\n**Requirements:**\n${requirements}`;

            const jobData = {
                title: jobTitle,
                location: location,
                description: combinedDescription,
                status: 'open', // Default status for new jobs
                skills: this.skills
            };

            this.apiService.postJob(jobData).subscribe({
                next: () => {
                    this.success = 'Job posted successfully!';
                    this.error = null;
                    this.jobForm.reset();
                    this.skills = [];
                },
                error: (err) => {
                    this.error = err.error.message || 'Failed to post job';
                    this.success = null;
                    console.error('Error posting job:', err);
                }
            });
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