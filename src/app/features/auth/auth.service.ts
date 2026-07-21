import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TenantRegistrationDto } from '../tenant-registration.model'; // Cleanly imports your updated type model file!

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Corrected to true backticks (`) to properly compute your cloud address variable string
  private baseAuthUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

   registerNewTenant(registrationData: TenantRegistrationDto): Observable<any> {
    return this.http.post<any>(`${this.baseAuthUrl}/register-tenant`, registrationData).pipe(
      tap(response => {
        if (response && response.tenantId) {
          localStorage.setItem('active_tenant_id', response.tenantId);
          console.log('Isolated production tenant workspace assigned:', response.tenantId);
        }
      })
    );
  }
}