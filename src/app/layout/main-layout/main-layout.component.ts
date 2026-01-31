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
type UserProfile = 'tourist' | 'company' | 'collaborator';

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
  fullname = '';
  userInitials = '';
  userRole = 'Touriste';
  userProfile: UserProfile = 'tourist';

  // Menu items - will be set based on user profile
  menuItems: MenuItem[] = [];

  // Menu configurations per profile
  private touristMenu: MenuItem[] = [
    { label: 'Dashboard', icon: 'bi bi-grid-1x2-fill', route: '/dashboard', exact: true },
    { label: 'Événements', icon: 'bi bi-calendar-event', route: '/events', exact: false },
    // { label: 'Bons Plans', icon: 'bi bi-percent', route: '/deals', exact: false },
    { label: 'Réservations', icon: 'bi bi-bookmark-check', route: '/reservations', exact: false },
    { label: 'Planificateur', icon: 'bi bi-calendar-range', route: '/planner', exact: false },
    // { label: 'Explorer', icon: 'bi bi-compass', route: '/explore', exact: false }
  ];

  private companyMenu: MenuItem[] = [
    { label: 'Dashboard', icon: 'bi bi-grid-1x2-fill', route: '/dashboard-etablissement', exact: true },
    { label: 'Réservations', icon: 'bi bi-calendar-check', route: '/reservations', exact: false, badge: 12 },
    { label: 'Offres', icon: 'bi bi-tag', route: '/offers', exact: false },
    { label: 'Avis', icon: 'bi bi-chat-quote', route: '/reviews', exact: false },
    { label: 'Statistiques', icon: 'bi bi-graph-up', route: '/stats', exact: false },
    { label: 'Paramètres', icon: 'bi bi-gear', route: '/settings', exact: false }
  ];

  private collaboratorMenu: MenuItem[] = [
    { label: 'Dashboard', icon: 'bi bi-grid-1x2-fill', route: '/dashboard-collaborateur', exact: true },
    { label: 'Mes Tâches', icon: 'bi bi-list-task', route: '/tasks', exact: false, badge: 8 },
    { label: 'Établissements', icon: 'bi bi-building', route: '/establishments', exact: false },
    { label: 'Messages', icon: 'bi bi-envelope', route: '/messages', exact: false, badge: 5 },
    { label: 'Rapports', icon: 'bi bi-file-earmark-bar-graph', route: '/reports', exact: false },
    { label: 'Paramètres', icon: 'bi bi-gear', route: '/settings', exact: false }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  private loadUserInfo(): void {
    // Get user info from localStorage (clés Gogenius)
    const storedFullname = localStorage.getItem('gogenius.fname');
    const storedRole = localStorage.getItem('gogenius.role');
    const storedPrefix = localStorage.getItem('gogenius.prefix');

    // Set fullname
    this.fullname = storedFullname || 'Utilisateur';
    
    // Use prefix as initials if available, otherwise generate
    this.userInitials = storedPrefix || this.generateInitials(this.fullname);
    console.log(storedRole);
    
    // Detect profile based on role and set menu
    // Y29tcGFueQ== = company (base64)
    // dG91cmlzdA== = tourist (base64)
    if (storedRole === 'dG91cmlzdA==') { // tourist
      this.userProfile = 'tourist';
      this.userRole = 'Touriste';
      this.menuItems = this.touristMenu;
    } else if (storedRole === 'Y29tcGFueQ==') { // company
      this.userProfile = 'company';
      this.userRole = 'Établissement';
      this.menuItems = this.companyMenu;
    } else { // collaborator or other
      this.userProfile = 'collaborator';
      this.userRole = 'Collaborateur';
      this.menuItems = this.collaboratorMenu;
    }
  }

  private generateInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getSidebarClass(): string {
    switch (this.userProfile) {
      case 'company':
        return 'sidebar-company';
      case 'collaborator':
        return 'sidebar-collaborator';
      default:
        return 'sidebar-tourist';
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 992) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
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
    if (window.innerWidth < 992) {
      this.closeMobileMenu();
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.showUserMenu = false;
    // Clear all gogenius localStorage keys
    localStorage.removeItem('gogenius.token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('gogenius.fname');
    localStorage.removeItem('gogenius.role');
    localStorage.removeItem('gogenius.prefix');
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']);
  }
}
