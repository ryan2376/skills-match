import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSeekerApplicationsComponent } from './job-seeker-applications.component';

describe('JobSeekerApplicationsComponent', () => {
  let component: JobSeekerApplicationsComponent;
  let fixture: ComponentFixture<JobSeekerApplicationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobSeekerApplicationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobSeekerApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
