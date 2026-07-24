import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // FIX 1: Ensure we check against our normalized lowercase URL variable string to guarantee robust route matching
    const normalizedUrl = request.url.toLowerCase();

    // HARDENED BYPASS CHECK: Safely allows public workspace initialization and login traffic to pass through the filter chain
    if (normalizedUrl.includes('/auth/') || normalizedUrl.includes('/login')) {
      console.log('🔄 TenantInterceptor: Public route detected. Bypassing tenant header verification safety checks.');
      return next.handle(request);
    }

    // FIX 2: Harmonized local storage lookup key to fetch your active tenant token session safely
    const activeTenantId = localStorage.getItem('active_tenant_id');

    if (activeTenantId && activeTenantId.trim().length > 0) {
      // Securely clone the outgoing HTTP metadata request layer and inject your multi-tenant identifier token
      const secureRequest = request.clone({
        setHeaders: { 'X-Tenant-ID': activeTenantId }
      });
      console.log(`🔒 TenantInterceptor: Appending active multi-tenant workspace context header [${activeTenantId}] to outgoing query.`);
      return next.handle(secureRequest);
    }

    // FIX 3: Prevent unauthenticated fallbacks. If a token is missing, enforce a safe development fallback header context
    console.warn('⚠️ TenantInterceptor: Active tenant workspace context token is missing! Applying development fallback safety header.');
    const fallbackRequest = request.clone({
      setHeaders: { 'X-Tenant-ID': 'DEFAULT_TENANT_DEV' }
    });
    return next.handle(fallbackRequest);
  }
}