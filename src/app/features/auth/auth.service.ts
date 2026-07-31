import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TenantRegistrationDto } from '../tenant-registration.model'; // Cleanly imports your updated model file!

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ✅ FIX: Converted to true backticks (`) and appended /api to cleanly map your cloud backend address mapping
  private baseAuthUrl = `${environment.apiUrl}/auth`;
  //private baseAuthUrl = 'https://onrender.com';

  constructor(private http: HttpClient) {}

  registerNewTenant(registrationData: TenantRegistrationDto): Observable<any> {
    // ✅ FIX: Uses the unified base URL variable to prevent 404 endpoint routing breaks
    return this.http.post<any>(`${this.baseAuthUrl}/register-tenant`, registrationData).pipe(
      tap(response => {
        if (response && response.tenantId) {
          // FIX: Synchronized local storage session key tracking to matching 'X-Tenant-ID' specifications
          localStorage.setItem('X-Tenant-ID', response.tenantId);
          console.log('Isolated production tenant workspace assigned:', response.tenantId);
        }
      })
    );
  }

  loginCashier(pin: string): Observable<any> {
    // ✅ FIX: Synchronized path structure using matching clean backtick syntax rules
    return this.http.post<any>(`${this.baseAuthUrl}/cashier-login`, { pin }).pipe(
      tap(response => {
        if (response && response.tenantId) {
          // Enforce immediate, synchronous local storage commitment
          localStorage.setItem('X-Tenant-ID', response.tenantId);
          localStorage.setItem('cashier_id', response.cashierId?.toString() || '1');
          localStorage.setItem('cashier_name', response.cashierName || 'Terminal Staff');
          console.log('AUTH SERVICE: Core tenant context locked and synced:', response.tenantId);
        }
      })
    );
  }
}