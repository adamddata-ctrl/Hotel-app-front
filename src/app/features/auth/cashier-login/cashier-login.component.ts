import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-cashier-login',
  templateUrl: './cashier-login.component.html',
  styleUrls: ['./cashier-login.component.css']
})
export class CashierLoginComponent implements OnInit {
  pinBuffer: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const currentworkspace = localStorage.getItem('X-Tenant-ID');
    console.log('Active SaaS workspace Session: ', currentworkspace || 'DEFAULT_TENANT_DEV');
  }

  clearPin(): void {
    this.pinBuffer = '';
  }

  appendDigit(digit: string): void {
    if (this.pinBuffer.length < 4) {
      this.pinBuffer += digit;
      if (this.pinBuffer.length === 4) {
        this.executePinValidation();
      }
    }
  }

  // HTML keypad bridge functions
  handleNumberInput(digit: string): void {
    this.appendDigit(digit);
  }

  handleClear(): void {
    this.clearPin();
  }

  private executePinValidation(): void {
    const payload = { pin: this.pinBuffer };

    this.http.post<any>(`${environment.apiUrl}/auth/cashier-login`, payload)
      .subscribe({
        next: (response) => {
          // STEP 1 DIAGNOSTIC TRACKER: See the exact backend property names across the network pipeline
          console.log('SERVER LOGIN RAW RESPONSE: ', response);

          if (response && response.success && response.tenantId) {
            localStorage.setItem('X-Tenant-ID', response.tenantId);
            localStorage.setItem('cashier_id', response.cashierId?.toString() || '1');
            localStorage.setItem('cashier_name', response.cashierName || 'Terminal Staff');

            if (response.role === 'OWNER' || response.role === 'MANAGER') {
              console.log('Access authorized for Owner dashboard workspace portal layout channel.');
              this.router.navigate(['/owner-dashboard/summary-metrics'], { 
                state: { tenantId: response.tenantId } 
              });
            }  else {
              console.log('Access authorized for Cashier Front Counter terminal register layouts.');
             this.router.navigate(['/register/waiters', response.tenantId]);
            }
          } else {
            console.error('CRITICAL: Server returned success status but omitted the multi-tenant identifier!');
            this.handleAuthFailure();
          }
        },
        error: (err) => {
          console.error('AUTH SYSTEM: Network pipe credential evaluation rejected.', err);
          this.handleAuthFailure();
        }
      });
  }

  private handleAuthFailure(): void {
    this.errorMessage = 'Invalid Cashier Security PIN. Please retry.';
    this.pinBuffer = '';
  }
}