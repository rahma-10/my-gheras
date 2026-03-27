import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const user = authService.currentUser();
  
  // Check if user is logged in and has admin role
  if (user && (user as any).role === 'admin') {
    return true;
  }
  
  console.warn('🚫 Admin Guard: Access denied. User is not an admin.');
  router.navigate(['/dashboard']);
  return false;
};
