import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LoginService } from 'src/app/authentication/login/login.service';
import { AuthenticationService } from 'src/app/authentication/authentication.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  exact: boolean;
  badge?: number;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {

  isMobileMenuOpen = false;
  showUserMenu = false;
  
  // User info
  userName = 'Genius User';
  userInitials = 'GOG';
  userRole = 'Internaute';

  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'bi bi-grid-1x2-fill', route: '/dashboard', exact: true },
    { label: 'Événements', icon: 'bi bi-calendar-event', route: '/events', exact: false, badge: 5 },
    { label: 'Bons Plans', icon: 'bi bi-percent', route: '/deals', exact: false },
    { label: 'Réservations', icon: 'bi bi-bookmark-check', route: '/reservations', exact: false },
    { label: 'Planificateur', icon: 'bi bi-calendar-range', route: '/planner', exact: false },
    { label: 'Explorer', icon: 'bi bi-compass', route: '/explore', exact: false }
  ];

  constructor(private router: Router, private authentificaiton:AuthenticationService) {}

  fullname:any=null;
  ngOnInit(): void {
    this.fullname = this.authentificaiton.getFullname().toUpperCase();
    this.userInitials = this.authentificaiton.getPrefixName().toUpperCase();
    this.userRole = this.authentificaiton.getProfile().toUpperCase();
  }

  @HostListener('window:resize')
  onResize(): void {
    // Close mobile menu on resize to desktop
    if (window.innerWidth >= 992) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Close user menu if clicked outside
    if (!target.closest('.sidebar-footer')) {
      this.showUserMenu = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  onNavClick(): void {
    // Close mobile menu when navigation item is clicked
    if (window.innerWidth < 992) {
      this.closeMobileMenu();
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.showUserMenu = false;
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
}