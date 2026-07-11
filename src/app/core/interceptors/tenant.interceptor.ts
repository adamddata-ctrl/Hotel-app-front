import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 1. Fetch the active restaurant tenant workspace token from browser local storage
    const activeTenantId = localStorage.getItem('active_tenant_id');

     // 2. Clone the request and inject the tracking header expected by our Spring Boot backend
    if (activeTenantId) {
      const secureRequest = request.clone({
        headers: request.headers.set('X-Tenant-ID', activeTenantId)
      });
      return next.handle(secureRequest);
    }

    // 3. Pass through if no tenant token is found in the browser session context yet
    return next.handle(request);
  }
}