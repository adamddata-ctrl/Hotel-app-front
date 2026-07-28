import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const tenantGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const activeTenantId = localStorage.getItem('X-Tenant-ID');

  // ✅ ENHANCED SECURITY FIREWALL: Block empty entries AND the old dev loop fallback string completely!
  if (activeTenantId && activeTenantId.trim() !== '' && activeTenantId !== 'DEFAULT_TENANT_DEV') {
    return true;
  }

  // Security Override: Force them back to the entrance login point if missing or corrupt
  console.warn('⚠️ SECURITY FIREWALL: Access denied. Multi-tenant workspace token missing or invalid.');
  router.navigate(['/auth/cashier-login']);
  return false;
};