// src/app/components/Employer/Edit-job/edit-job.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../Navbar/navbar.component';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-edit-job',
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
  templateUrl: './edit-job.component.html',
  styleUrls: ['./edit-job.component.css']
})
export class EditJobComponent implements OnInit {
  jobForm: FormGroup;
  skills: string[] = [];
  error: string | null = null;
  success: string | null = null;
  jobId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.jobForm = this.fb.group({
      jobTitle: ['', [Validators.required, Validators.minLength(3)]],
      location: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['open', Validators.required]
    });
  }

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id');
    if (!this.jobId) {
        this.error = 'Invalid job ID';
        this.router.navigate(['/employer/dashboard']);
        return;
    }

    const jobId: string = this.jobId;

    // Fetch job details to prefill the form
    this.apiService.getJobById(jobId).subscribe({
        next: (job) => {
            // Split description into description and requirements (if applicable)
            let description = job.description;
            let requirements = '';
            const requirementsIndex = job.description.indexOf('**Requirements:**');
            if (requirementsIndex !== -1) {
                description = job.description.substring(0, requirementsIndex).trim();
                requirements = job.description.substring(requirementsIndex + '**Requirements:**'.length).trim();
            }

            this.jobForm.patchValue({
                jobTitle: job.title,
                location: job.location,
                description: description,
                status: job.status
            });

            this.skills = job.skills || [];
        },
        error: (err) => {
            this.error = err.message || 'Failed to load job details';
            console.error('Error loading job:', err);
        }
    });
}

  onSubmit(): void {
    if (this.jobForm.valid && this.jobId) {
      const { jobTitle, location, description, status } = this.jobForm.value;
      const jobData = {
        title: jobTitle,
        location: location,
        description: description,
        status: status,
        skills: this.skills
      };

      // Since we've checked that jobId is not null, we can safely cast it
      const jobId: string = this.jobId;

      this.apiService.updateJob(jobId, jobData).subscribe({
        next: () => {
          this.success = 'Job updated successfully!';
          this.error = null;
          setTimeout(() => {
            this.router.navigate(['/employer/dashboard']);
          }, 2000);
        },
        error: (err) => {
          this.error = err.message || 'Failed to update job';
          this.success = null;
          console.error('Error updating job:', err);
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