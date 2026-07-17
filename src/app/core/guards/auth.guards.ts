import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // 🔥 FIXED: Changed key string 'cashierId' to match your exact storage key 'cashier_id' with an underscore!
  const cashierId = localStorage.getItem('cashier_id');

  // Verify that an active session key exists in the persistent store rows
  if (cashierId) {
    console.log('🛡️ AUTH GUARD: Persistent session authenticated. Access granted.');
    return true; 
  }

  console.warn('🛡️ AUTH GUARD: Identity key empty. Access blocked.');
  router.navigate(['/login']);
  return false;
};