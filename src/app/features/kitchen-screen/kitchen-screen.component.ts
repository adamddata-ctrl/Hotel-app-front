import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
// FIX: Corrected relative path climb to safely step out of the kitchen directories into environments
import { environment } from '../../../environments/environment';

interface KitchenItem {
  itemName: string;
  quantity: number;
}

interface KitchenOrder {
  id: number;
  waiterName: string;
  orderTime: string;
  items: KitchenItem[];
}

@Component({
  selector: 'app-kitchen-screen',
  templateUrl: './kitchen-screen.component.html',
  styleUrls: ['./kitchen-screen.component.css']
})
export class KitchenScreenComponent implements OnInit, OnDestroy {
  public openOrders: KitchenOrder[] = [];
  public errorMessage: string = '';
  public isLoading: boolean = false;
  private pollingSubscription!: Subscription;

  constructor(private http: HttpClient) {}

  public ngOnInit(): void {
    this.isLoading = true;
    
    // AUTOMATED LONG-POLLING FEED: Queries your backend database every 5 seconds [3.3]
    // Note: Your TenantInterceptor automatically handles attaching the required X-Tenant-ID header!
    this.pollingSubscription = interval(5000)
      .pipe(
        startWith(0),
        // FIX: Swapped out broken single-quotes for clean backticks (`) and pointed directly to your plural backend route
        switchMap(() => this.http.get<KitchenOrder[]>(`${environment.apiUrl}/orders/open`))
      )
      .subscribe({
        next: (data) => {
          this.openOrders = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('KDS FEEDS ENGINE: Failed to synchronize live kitchen queues.', err);
          this.errorMessage = 'Lost communication link with the main order routing server.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Clears out an order ticket card dynamically from the screen once dishes are prepared [3.3].
   */
  public fulfillOrderTicket(orderId: number): void {
    this.isLoading = true;
    
    // FIX: Standardized routing parameters to resolve kitchen fulfillment actions cleanly via backticks
    this.http.post(`${environment.apiUrl}/orders/${orderId}/fulfill`, {}).subscribe({
      next: () => {
        // Instantly filter out the card from the UI layout matrix state for maximum responsiveness [3.3]
        this.openOrders = this.openOrders.filter(order => order.id !== orderId);
        this.isLoading = false;
        console.log(`KDS ENGINE: Order Ticket #${orderId} successfully marked cooked.`);
      },
      error: (err) => {
        console.error('KDS ENGINE: Fulfill notification failed.', err);
        this.errorMessage = 'Fulfillment notification failed. Check network link.';
        this.isLoading = false;
      }
    });
  }

  public ngOnDestroy(): void {
    if (this.pollingSubscription) {
      // Securely close polling streams when the component unmounts to prevent memory leaks [3.3]
      this.pollingSubscription.unsubscribe();
    }
  }
}