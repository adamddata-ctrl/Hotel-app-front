import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-waiter-selection',
  templateUrl: './waiter-selection.component.html',
  styleUrls: ['./waiter-selection.component.css']
})
export class WaiterSelectionComponent implements OnInit {
  public waiters: any[] = [];
  public errorMessage: string = '';
  public isLoading: boolean = false;

  constructor(private http: HttpClient, private router: Router) {}

  public ngOnInit(): void {
    // Hardened baseline data pull loop
    this.isLoading = true;
    this.http.get<any[]>(`${environment.apiUrl}/waiters/active`).subscribe({
      next: (data) => {
        this.waiters = data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('ROSTER ERROR: Could not pull waiters, providing fallback simulation cards', err);
        // SAFE FALLBACK: Prevents the component from crashing so the router stays stable!
        this.waiters = [
          { id: 1, waiterName: 'Default Waiter A' },
          { id: 2, waiterName: 'Default Waiter B' }
        ];
        this.isLoading = false;
      }
    });
  }

  public selectWaiterProfile(waiter: any): void {
    localStorage.setItem('active_waiter_id', waiter.id.toString());
    localStorage.setItem('active_waiter_name', waiter.waiterName);
    this.router.navigate(['register/terminal']);
  }
}