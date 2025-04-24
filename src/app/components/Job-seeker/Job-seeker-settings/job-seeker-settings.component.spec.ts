import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSeekerSettingsComponent } from './job-seeker-settings.component';

describe('JobSeekerSettingsComponent', () => {
  let component: JobSeekerSettingsComponent;
  let fixture: ComponentFixture<JobSeekerSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobSeekerSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobSeekerSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
