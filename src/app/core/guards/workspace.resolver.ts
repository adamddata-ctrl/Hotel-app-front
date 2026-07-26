import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceResolver implements Resolve<string | null> {
  constructor(private router: Router) {}

  resolve(): Observable<string | null> {
    // 🚀 STEP 1: Extract the instant token from high-speed router state memory
    const currentNavigation = this.router.getCurrentNavigation();
    const stateToken = currentNavigation?.extras.state?.['tenantId'];

    if (stateToken && stateToken.trim() !== '' && stateToken !== 'DEFAULT_TENANT_DEV') {
      console.log(`🌍 GLOBAL RESOLVER: Context verified via memory handshake: [${stateToken}]`);
      // Force write it to storage as a backup for page refreshes
      localStorage.setItem('X-Tenant-ID', stateToken);
      return of(stateToken);
    }

    // 🚀 STEP 2: Fall back to local storage ONLY if they manually refreshed the browser page
    const localStorageToken = localStorage.getItem('X-Tenant-ID');
    if (localStorageToken && localStorageToken.trim() !== '' && localStorageToken !== 'DEFAULT_TENANT_DEV') {
      console.log(`🌍 GLOBAL RESOLVER: Context verified via storage lookup: [${localStorageToken}]`);
      return of(localStorageToken);
    }

    // 🚀 STEP 3: Complete safety lockout if both memory and storage are empty
    console.error('🌍 GLOBAL RESOLVER: Missing multi-tenant token context. Canceling route initialization.');
    this.router.navigate(['/login']);
    return of(null);
  }
}