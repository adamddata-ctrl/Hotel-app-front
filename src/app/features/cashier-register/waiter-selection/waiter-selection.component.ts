import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface Waiter {
  id: number;
  waiterName: string;
  active: boolean;
}

@Component({
  selector: 'app-waiter-selection',
  templateUrl: './waiter-selection.component.html',
  styleUrls: ['./waiter-selection.component.css']
})
export class WaiterSelectionComponent implements OnInit {
  waitersList: Waiter[] = [];
  errorMessage: string = '';
  showModal: boolean = false;
  newWaiterName: string = '';

  constructor(private http: HttpClient, private router: Router) {
    // 🚀 READ SYSTEM ROUTER STATE INSTANTLY ON INSTANTIATION:
    // Captures the token before ngOnInit or interceptors run background queries
    const navigation = this.router.getCurrentNavigation();
    const passedTenantId = navigation?.extras.state?.['tenantId'];
    if (passedTenantId) {
      localStorage.setItem('X-Tenant-ID', passedTenantId);
    }
  }

  ngOnInit(): void {
    this.fetchActiveWaiters();
  }

 fetchActiveWaiters(): void {
  // Pull a fresh read from the browser storage disk right now
  const tenantId = localStorage.getItem('X-Tenant-ID');

  // If the token isn't fully written yet, check again in 150ms
  

  // Executes safely ONLY when a valid token is found and verified
  this.http.get<Waiter[]>(`${environment.apiUrl}/waiters/active`)
    .subscribe({
      next: (data) => {
        this.waitersList = data;
        this.errorMessage = ''; 
      },
      error: (err) => {
        console.error('FAILED TO FETCH RESTAURANT WAITERS:', err);
        this.errorMessage = 'Failed to load restaurant waiters. Please refresh.';
      }
    });
}
  selectWaiter(waiter: Waiter): void {
    localStorage.setItem('selected_waiter_id', waiter.id.toString());
    localStorage.setItem('selected_waiter_name', waiter.waiterName);
    this.router.navigate(['/register/terminal']);
  }

  toggleAddModal(): void {
    this.showModal = !this.showModal;
    this.newWaiterName = '';
  }

  submitNewWaiter(): void {
    if (!this.newWaiterName || !this.newWaiterName.trim()) return;

    const tenantId = localStorage.getItem('X-Tenant-ID');
    if (!tenantId) {
      this.errorMessage = 'Session context expired. Please log out and enter your PIN again.';
      return;
    }

    const payload = { waiterName: this.newWaiterName.trim() };
    
    this.http.post<Waiter>(`${environment.apiUrl}/waiters`, payload)
      .subscribe({
        next: (newWaiter) => {
          this.waitersList.push(newWaiter);
          this.toggleAddModal();
        },
        error: (err) => {
          console.error('FAILED TO CREATE WAITER ENTRY:', err);
          this.errorMessage = 'Failed to register the new waiter. Try again.';
        }
      });
  }
}