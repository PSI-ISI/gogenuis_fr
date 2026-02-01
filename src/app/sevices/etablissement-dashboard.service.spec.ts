import { TestBed } from '@angular/core/testing';

import { EtablissementDashboardService } from './etablissement-dashboard.service';

describe('EtablissementDashboardService', () => {
  let service: EtablissementDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtablissementDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
