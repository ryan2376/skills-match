import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSeekerDashComponent } from './job-seeker-dash.component';

describe('JobSeekerDashComponent', () => {
  let component: JobSeekerDashComponent;
  let fixture: ComponentFixture<JobSeekerDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobSeekerDashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobSeekerDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
