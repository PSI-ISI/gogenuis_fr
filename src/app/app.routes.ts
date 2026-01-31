import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './guards/auth.guard';

export const appRoutes: Routes = [
  // ============================================
  // AUTH ROUTES - Sans sidebar
  // ============================================
  { 
    path: 'auth', 
    canActivate: [noAuthGuard],
    loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule)
    // ↑ IMPORTANT: Charger AuthenticationModule, PAS AuthenticationRoutingModule
  },
  
  // ============================================
  // PROTECTED ROUTES - Avec sidebar (MainLayout)
  // ============================================
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      { 
        path: 'dashboard-etablissement', 
        loadComponent: () => import('./pages/etablissement-dashboard/etablissement-dashboard.component').then(m => m.EtablissementDashboardComponent)
      },
      { 
        path: 'dashboard-collaborateur', 
        loadComponent: () => import('./pages/collaborateur-dashboard/collaborateur-dashboard.component').then(m => m.CollaborateurDashboardComponent)
      },
      { 
        path: 'events', 
         loadComponent: () => import('./pages/events/events.component').then(m => m.EventsComponent)
      },
      { 
        path: 'deals', 
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      { 
        path: 'reservations', 
        loadComponent: () => import('./pages/reservations/reservations.component').then(m => m.ReservationsComponent)
      },
      { 
        path: 'planner', 
        loadComponent: () => import('./pages/planner/planner.component').then(m => m.PlannerComponent)
      },
      { 
        path: 'explore', 
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      { 
        path: 'settings', 
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
    ]
  },
  
  // Wildcard
  { path: '**', redirectTo: '/auth/login' }
];