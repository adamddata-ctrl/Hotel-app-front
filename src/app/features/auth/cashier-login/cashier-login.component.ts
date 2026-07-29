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
  // 🌟 ADD THIS LINE RIGHT HERE TO FIX THE BUILD ERROR:
  errorMessage: string | null = null; 

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {}

  appendDigit(digit: string): void {
    // Clear any existing error message when they start typing a new PIN
    this.errorMessage = null; 
    
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
    this.errorMessage = null;
  }

  private executePinValidation(): void {
    const payload = { pinCode: this.pinBuffer };

    this.http.post<any>(`${environment.apiUrl}/api/auth/cashier-login`, payload)
      .subscribe({
        next: (response) => {
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
              this.router.navigate(['/waiter-selection']);
            }
          }
        },
        error: (err) => {
          console.error('Authentication request cycle aborted by network processor:', err);
          
          // 🌟 THIS SETS THE ERROR PANEL IN YOUR HTML SO THE CASHIER SEES IT:
          this.errorMessage = 'Login Failed: Invalid PIN code or network error.';
          this.handleClear();
        }
      });
  }
}