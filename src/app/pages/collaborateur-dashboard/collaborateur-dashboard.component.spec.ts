import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollaborateurDashboardComponent } from './collaborateur-dashboard.component';

describe('CollaborateurDashboardComponent', () => {
  let component: CollaborateurDashboardComponent;
  let fixture: ComponentFixture<CollaborateurDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollaborateurDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollaborateurDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
