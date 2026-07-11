import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cashier-login',
  templateUrl: './cashier-login.component.html',
  styleUrls: ['./cashier-login.component.css']
})
export class CashierLoginComponent {
  // Array buffer string token storage mechanism to retain current pin status
  pinBuffer: string = '';
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}
   /**
   * Append individual numeric input configurations triggered via cashier panel grid buttons
   */
  handleNumberInput(num: string): void {
    if (this.pinBuffer.length < 4) {
      this.pinBuffer += num;
      this.errorMessage = '';
    }

    // Automatically fire credential validation routing sequence upon filling the 4-digit matrix bounds
    if (this.pinBuffer.length === 4) {
      this.executePinValidation();
    }
  }

  /**
   * Wipe the current backplane string array layout matrix clean
   */
  handleClear(): void {
    this.pinBuffer = '';
    this.errorMessage = '';
  }

  /**
   * Submit transaction authentication payload data blocks downstream to Spring Boot REST backend
   */
  private executePinValidation(): void {
    const payload = { pin: this.pinBuffer };

    this.http.post<any>('http://localhost:8080/api/auth/cashier-login', payload)
      .subscribe({
        next: (response) => {
          if (response.success) {  
            
            // Save the contextual metadata payload variables safely to localStorage browser memory banks
            localStorage.setItem('active_tenant_id', response.tenantId);
            localStorage.setItem('cashier_id', response.cashierId);
            localStorage.setItem('cashier_name', response.cashierName);
            
            // Redirect the cashier workspace view layout context forward to the Waiter Selection Screen
            this.router.navigate(['/register/waiters']);
          } else {
            this.handleAuthFailure();
          }
        },
        error: (err) => {
          this.handleAuthFailure();
        }
      });
  }
   private handleAuthFailure(): void {
    this.errorMessage = 'Invalid Cashier Security PIN. Please retry.';
    this.pinBuffer = ''; // Flush data parameters instantly to block data leaks
  }
}