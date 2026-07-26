import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 1. Fetch the exact production storage token key
    const activeTenantId = localStorage.getItem('X-Tenant-ID');

    // 2. Safely check if a genuine token string is actively present
    if (activeTenantId && activeTenantId.trim().length > 0) {
      console.log(`🏠 TenantInterceptor: Injecting verified multi-tenant context: [${activeTenantId}]`);
       // Clone the request and securely insert the tenant context into the HTTP header
      const tenantRequest = request.clone({
        headers: request.headers.set('X-Tenant-ID', activeTenantId.trim())
      });
      
      return next.handle(tenantRequest);
    }
 // 3. Fallback: Log a clear warning instead of passing corrupt default data strings
    console.warn('⚠️ TenantInterceptor: No multi-tenant token found in storage. Forwarding standard raw request.');
    return next.handle(request);
  }
}