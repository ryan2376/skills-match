import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSeekerMatchesComponent } from './job-seeker-matches.component';

describe('JobSeekerMatchesComponent', () => {
  let component: JobSeekerMatchesComponent;
  let fixture: ComponentFixture<JobSeekerMatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobSeekerMatchesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobSeekerMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
