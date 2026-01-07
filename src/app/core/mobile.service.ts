import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class MobileService {
  private mobileSubject = new BehaviorSubject<boolean>(false);
  public mobileChanged$ = this.mobileSubject.asObservable();

  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkMobile();
      window.addEventListener('resize', () => this.checkMobile());
    }
  }

  isMobile(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return window.innerWidth <= 768;
  }

  private checkMobile(): void {
    const isMobile = this.isMobile();
    if (isMobile !== this.mobileSubject.value) {
      this.mobileSubject.next(isMobile);
    }
  }
}