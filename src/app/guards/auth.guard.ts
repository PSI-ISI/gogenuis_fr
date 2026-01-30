import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

/**
 * Guard pour les routes protégées (dashboard, etc.)
 * Redirige vers /auth/login si pas de token
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  
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
 * Redirige vers /dashboard si déjà connecté
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  
  console.log('noAuthGuard - token:', token ? 'exists' : 'not found');
  
  if (token) {
    router.navigate(['/dashboard']);
    return false;
  } else {
    return true;
  }
};