import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtablissementsCollaborateurComponent } from './etablissements-collaborateur.component';

describe('EtablissementsCollaborateurComponent', () => {
  let component: EtablissementsCollaborateurComponent;
  let fixture: ComponentFixture<EtablissementsCollaborateurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtablissementsCollaborateurComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EtablissementsCollaborateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
