import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { TenantRegistrationDto } from '../../tenant-registration.model';

@Component({
  selector: 'app-tenant-signup',
  templateUrl: './tenant-signup.component.html',
  styleUrls: ['./tenant-signup.component.css']
})
 export class TenantSignupComponent {
  
  // Explicit data object model synchronized with your Spring Boot DTO fields
  public signupData: TenantRegistrationDto = { 
     username: '',
    password: '',
    pinCode: '',
    fullName: ''
  };

  public isSubmitting: boolean = false;
  public errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
 /**
   * Fires when the independent restaurant clicks the registration button.
   */
  public onSignupSubmit(): void {
    if (!this.validateFormInputs()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    console.log('Dispatching dynamic SaaS workspace registration details...');
    
    this.authService.registerNewTenant(this.signupData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
         alert(`SUCCESS! Independent Workspace Created.\n\nYour Unique Tenant ID is: ${response.tenantId}\n\nPlease secure this token!`);
        
        // Dynamic navigation to clear context and push user to the fresh terminal screen
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Workspace registration pipeline failed:', err);
        this.errorMessage = err.error?.message || 'Could not provision isolated workspace. Please verify fields and retry.';
      }
    });
  }

  /**
   * Simple client-side constraints validation layer
   *  */
  private validateFormInputs(): boolean {
    if (!this.signupData.fullName.trim()) {
      this.errorMessage = 'Please provide a valid Restaurant or Brand Name.';
      return false;
    }
    if (!this.signupData.username.trim()) {
      this.errorMessage = 'Owner Username field cannot be empty.';
      return false;
    }
    if (this.signupData.password.length < 6) {
      this.errorMessage = 'Manager Password must be at least 6 characters long.';
      return false;
    }
     if (this.signupData.pinCode.length !== 4 || isNaN(Number(this.signupData.pinCode))) {
      this.errorMessage = 'Default Cashier PIN must be exactly 4 numeric digits.';
      return false;
    }
    return true;
  }
}