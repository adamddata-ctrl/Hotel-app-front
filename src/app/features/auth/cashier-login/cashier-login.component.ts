import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cashier-login',
  templateUrl: './cashier-login.component.html',
  styleUrls: ['./cashier-login.component.css']
})
export class CashierLoginComponent implements OnInit {
  pinBuffer: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {}

  appendDigit(digit: string): void {
    if (this.pinBuffer.length < 4) {
      this.pinBuffer += digit;
    }
  }

  // HTML keypad bridge functions
  handleNumberInput(digit: string): void {
    this.appendDigit(digit);
  }

  handleClear(): void {
    this.pinBuffer = '';
  }

  private executePinValidation(): void {
    const payload = { pinCode: this.pinBuffer };

    this.http.post<any>(`${environment.apiUrl}/api/auth/cashier-login`, payload)
      .subscribe({
        next: (response) => {
          // STEP 1 DIAGNOSTIC TRACKER: See the exact backend property names across the network pipeline
          console.log('SERVER LOGIN RAW RESPONSE: ', response);

          if (response && response.status === 'SUCCESS') {
            localStorage.setItem('X-Tenant-ID', localStorage.getItem('X-Tenant-ID') || 'DEFAULT_TENANT_DEV');
            localStorage.setItem('cashier_id', '1');
            localStorage.setItem('cashier_name', response.username || 'Terminal Staff');

            if (response.role === 'OWNER' || response.role === 'MANAGER') {
              console.log('Access authorized for Owner dashboard workspace portal layout channel.');
              this.router.navigate(['/owner-dashboard/summary-metrics'], {
                state: { tenantId: localStorage.getItem('X-Tenant-ID') }
              });
            } else {
              // Standard cashier or waiter routing path entry step
              this.router.navigate(['/waiter-selection']);
            }
          }
        },
        error: (err) => {
          console.error('Authentication request cycle aborted by network processor:', err);
          alert('Login Failed: Invalid credentials or structural network channel error.');
          this.handleClear();
        }
      });
  }
}