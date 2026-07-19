import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
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
  openOrders: KitchenOrder[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  private pollingSubscription!: Subscription;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.isLoading = true;
    // 🔥 AUTOMATED LONG-POLLING FEED: Queries your backend database every 5 seconds
    // Note: Your TenantInterceptor automatically handles attaching the required X-Tenant-ID header!
    this.pollingSubscription = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => this.http.get<KitchenOrder[]>(`${environment.apiUrl}/api/checkout/orders/open`))
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
   * Clears out an order ticket card dynamically from the screen once dishes are prepared
   */
  fulfillOrderTicket(orderId: number): void {
    this.http.post(`${environment.apiUrl}/api/checkout/orders/${orderId}/fulfill`, {})
      .subscribe({
        next: () => {
          // Instantly filter out the card from the UI layout matrix state for maximum responsive speed
          this.openOrders = this.openOrders.filter(order => order.id !== orderId);
          console.log(`🍳 KDS ENGINE: Order Ticket #${orderId} successfully marked cooked.`);
        },
        error: () => {
          this.errorMessage = 'Fulfillment notification failed. Check network link.';
        }
         });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe(); // Securely close polling sockets when the component unmounts
    }
  }
}