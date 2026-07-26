import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceResolver implements Resolve<string | null> {
  constructor(private router: Router) {}

  resolve(): Observable<string | null> {
    const tenantId = localStorage.getItem('X-Tenant-ID');

    // If a genuine tenant token is found, pass it through instantly
    if (tenantId && tenantId !== 'DEFAULT_TENANT_DEV') {
      return of(tenantId);
    }

    // Global Fallback Safety: If missing, kick the user out to the workspace setup or login terminal
    console.error('🌍 GLOBAL RESOLVER: Missing multi-tenant token context. Canceling route initialization.');
    this.router.navigate(['/login']);
    return of(null);
  }
}