import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 1. Check if this is an authentication/registration request
    if (request.url.includes('/auth/')) {
      // Let it pass completely clean WITHOUT any X-Tenant-ID header
      return next.handle(request);
    }
    const activeTenantId = localStorage.getItem('active_tenant_id');

    // 3. Clone the request and inject the tracking header expected by our Spring Boot backend
    if (activeTenantId) {
      const secureRequest = request.clone({
        setHeaders: {
          'X-Tenant-ID': activeTenantId
        }
      });
      return next.handle(secureRequest);
    }

    // 4. Fallback if no tenant token is found in the browser session context yet
    return next.handle(request);
  }
}