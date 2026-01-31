import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

const getToken = (): string | null => {
  return localStorage.getItem('gogenius.token') 
      || localStorage.getItem('auth_token') 
      || localStorage.getItem('token');
};

/**
 * Helper to get user role for redirect
 */
const getUserRole = (): string | null => {
  return localStorage.getItem('gogenius.role');
};
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = getToken();
  
  console.log('authGuard - token:', token ? 'exists' : 'not found');
  
  if (token) {
    return true;
  } else {
    router.navigate(['/auth/login']);
    return false;
  }
};

/**
 * Guard pour les pages d'auth (login, register)
 * Redirige vers le bon dashboard si déjà connecté
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = getToken();
  const role = getUserRole();
  
  console.log('noAuthGuard - token:', token ? 'exists' : 'not found', 'role:', role);
  
  if (token) {
    // Redirect to appropriate dashboard based on role
    if (role === 'dG91cmlzdA==') { // tourist
      router.navigate(['/dashboard']);
    } else if (role === 'Y29tcGFueQ==') { // company
      router.navigate(['/dashboard-etablissement']);
    } else { // collaborator or other
      router.navigate(['/dashboard-collaborateur']);
    }
    return false;
  } else {
    return true;
  }
};