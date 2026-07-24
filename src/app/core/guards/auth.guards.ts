import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const targetUrl = state.url.toLowerCase();

  // 1. PERMANENT BYPASS: If navigating to tenant signup or login, let the request pass immediately
  if (targetUrl.includes('register-tenant') || targetUrl.includes('login')) {
    return true;
  }

  // 2. Existing check: Pull the terminal cashier session tracking ID
  const cashierId = localStorage.getItem('cashier_id');
   // Verify that an active session key exists in the persistent store rows
  if (cashierId) {
    console.log('🔑 AUTH GUARD: Persistent session authenticated. Access granted.');
    return true;
  }

  console.warn('⚠️ AUTH GUARD: Identity key empty. Access blocked.');
  router.navigate(['/login']);
  return false;
};