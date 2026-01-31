import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtablissementDashboardComponent } from './etablissement-dashboard.component';

describe('EtablissementDashboardComponent', () => {
  let component: EtablissementDashboardComponent;
  let fixture: ComponentFixture<EtablissementDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtablissementDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EtablissementDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
