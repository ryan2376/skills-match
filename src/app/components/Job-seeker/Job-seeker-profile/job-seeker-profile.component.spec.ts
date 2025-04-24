import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSeekerProfileComponent } from './job-seeker-profile.component';

describe('JobSeekerProfileComponent', () => {
  let component: JobSeekerProfileComponent;
  let fixture: ComponentFixture<JobSeekerProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobSeekerProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobSeekerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
