import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const tenantGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const activeTenantId = localStorage.getItem('active_tenant_id');

  // If an active restaurant workspace ID exists in memory, allow passage
  if (activeTenantId && activeTenantId.trim() !== '') {
    return true;
  }

  // Security Override: Force them back to the entrance login point if missing
  console.warn('SECURITY FIREWALL: Access denied. Multi-tenant workspace token missing.');
  router.navigate(['/auth/cashier-login']);
  return false;
};