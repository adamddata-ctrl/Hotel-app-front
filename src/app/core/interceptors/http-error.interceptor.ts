import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  /**
   * Automatically intercepts all outbound API traffic to catch server drops or database timeouts [3.1].
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
         let displayMessage = 'An unexpected system network event occurred.';

        // 1. Detect if the local network is down or the Spring Boot server is turned off completely
        if (error.status === 0) {
          displayMessage = '⚠️ SERVER DISCONNECTED: Cannot establish link with the backend service. Check network cables.';
          console.error('NETWORK FIREWALL BREAKDOWN: Host port 8080 unreachable.', error);
        } 
        // 2. Catch internal database query processing failures (like a MySQL crash)
        else if (error.status === 500) {
          displayMessage = '❌ DATABASE ERROR: The database failed to process this operation. Contact support.';
        } 
        // 3. Catch unauthorized access errors cleanly
        else if (error.status === 403 || error.status === 401) {
          displayMessage = '🔒 ACCESS DENIED: Security clearance verification failed.';
        }
         // Display a clean administrative alert window so the cashier knows exactly what is happening
        alert(displayMessage);

        // Forward the error smoothly down the pipeline so controllers can update their local loading animations
        return throwError(() => error);
      })
    );
  }
}