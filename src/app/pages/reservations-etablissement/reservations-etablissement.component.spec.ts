import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationsEtablissementComponent } from './reservations-etablissement.component';

describe('ReservationsEtablissementComponent', () => {
  let component: ReservationsEtablissementComponent;
  let fixture: ComponentFixture<ReservationsEtablissementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationsEtablissementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReservationsEtablissementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
