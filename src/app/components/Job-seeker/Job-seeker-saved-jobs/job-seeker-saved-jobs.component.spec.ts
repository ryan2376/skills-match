import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSeekerSavedJobsComponent } from './job-seeker-saved-jobs.component';

describe('JobSeekerSavedJobsComponent', () => {
  let component: JobSeekerSavedJobsComponent;
  let fixture: ComponentFixture<JobSeekerSavedJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobSeekerSavedJobsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobSeekerSavedJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
