import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceResolver implements Resolve<any> {
  constructor(private router: Router) {}

  resolve(): Observable<any> {
    // 1. Check Instant Router state memory channel
    const currentNavigation = this.router.getCurrentNavigation();
    const stateToken = currentNavigation?.extras.state?.['tenantId'];

    if (stateToken && stateToken.trim() !== '' && stateToken !== 'DEFAULT_TENANT_DEV') {
      localStorage.setItem('X-Tenant-ID', stateToken);
      return of(stateToken);
    }

    // 2. Check local storage disk
    const immediateToken = localStorage.getItem('X-Tenant-ID');
    if (immediateToken && immediateToken.trim() !== '' && immediateToken !== 'DEFAULT_TENANT_DEV') {
      return of(immediateToken);
    }

    // 3. GLOBAL SAFETY RETRY BUFFER: If storage is settling during a full reload, wait 150ms and check one final time
    console.warn('⚠️ GLOBAL RESOLVER: Storage settling detected on page boot. Intended async retry queue activated.');

    return timer(150).pipe(
      switchMap(() => {
        const secondaryToken = localStorage.getItem('X-Tenant-ID');

        if (secondaryToken && secondaryToken.trim() !== '' && secondaryToken !== 'DEFAULT_TENANT_DEV') {
          console.log(`✅ GLOBAL RESOLVER: Context secured after async retry loop: [${secondaryToken}]`);
          return of(secondaryToken);
        }

        // 4. Absolute structural lockout only if it remains completely empty after the wait period
        console.error('❌ GLOBAL RESOLVER: Missing multi-tenant token context. Canceling route initialization.');
        
        // 🔥 FIXED: Route matched to 'login' in AppRoutingModule
        this.router.navigate(['/login']); 
        return of(null);
      }),
      take(1)
    );
  }
}
