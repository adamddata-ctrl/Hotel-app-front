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
  public waitersList: Waiter[] = [];
  public errorMessage: string = '';
  public showModal: boolean = false;
  public newWaiterName: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Automatically executes the server data retrieval sequence when the UI page mounts.
   */
  ngOnInit(): void {
    this.fetchActiveWaiters();
  }

  fetchActiveWaiters(): void {
    // FIX: Converted single quotes to true backticks (`) to properly parse your base environment URL string
    this.http.get<Waiter[]>(`${environment.apiUrl}/waiters/active`)
      .subscribe({
        next: (data) => {
          this.waitersList = data;
        },
        error: (err) => {
          console.error('FAILED TO FETCH RESTAURANT WAITERS:', err);
          this.errorMessage = 'Failed to load restaurant waiters. Please refresh the browser session.';
        }
      });
  }

  /**
   * Tracks the chosen worker assignment metrics inside active browser cache memory
   * and routes the workspace terminal view directly into the floor check order paths.
   */
  selectWaiter(waiter: Waiter): void {
    localStorage.setItem('selected_waiter_id', waiter.id.toString());
    localStorage.setItem('selected_waiter_name', waiter.waiterName);
    
    // FIX: Synchronized routing parameters to navigate cleanly to your true 'order-terminal' view asset path
    this.router.navigate(['/register/order-terminal']);
  }

  /**
   * Toggles the quick-insert shortcut pop-up interface overlay view state.
   */
  toggleAddModal(): void {
    this.showModal = !this.showModal;
    this.newWaiterName = '';
  }

  /**
   * Executes a direct outbound REST network stream to create a new worker row
   * inside our production cloud MySQL database cluster.
   */
  submitNewWaiter(): void {
    if (!this.newWaiterName || !this.newWaiterName.trim()) return;

    const payload = { waiterName: this.newWaiterName.trim() };

    // FIX: Converted single quotes to true backticks (`) to ensure clean endpoint transmission properties
    this.http.post<Waiter>(`${environment.apiUrl}/waiters/create`, payload)
      .subscribe({
        next: () => {
          this.toggleAddModal();
          this.fetchActiveWaiters(); // Refresh database arrays dynamically across the grid display block
        },
        error: (err) => {
          console.error('FAILED TO PROVISION WAITER RECORD:', err);
          this.errorMessage = 'Could not register staff member profile details. Try again.';
        }
      });
  }
}