import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const url = request.url.toLowerCase();

    // HARDENED BYPASS CHECK: Matches /auth, register-tenant, or login paths completely case-insensitive
    if (url.includes('/auth') || url.includes('register-tenant') || url.includes('/login')) {
      console.log('🛡️ TenantInterceptor: Public route detected. Bypassing tenant header completely.');
      return next.handle(request); 
       }

    // 2. Fetch the workspace token from browser storage for secure endpoints
    const activeTenantId = localStorage.getItem('active_tenant_id');

    if (activeTenantId) {
      const secureRequest = request.clone({
        setHeaders: { 'X-Tenant-ID': activeTenantId }
      });
      return next.handle(secureRequest);
    }

    // Default fallback
    return next.handle(request);
  }
}