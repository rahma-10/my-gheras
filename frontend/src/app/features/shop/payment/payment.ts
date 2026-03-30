import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StoreService } from '../../../core/services/store.service';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class PaymentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  public storeService = inject(StoreService);
  private alertService = inject(AlertService);

  orderId = signal<string | null>(null);
  iframeUrl = signal<SafeResourceUrl | null>(null);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['orderId'];
      if (id) {
        this.orderId.set(id);
        this.fetchPaymentUrl(id);
      } else {
        this.alertService.show('طلب غير صالح', 'error');
        this.router.navigate(['/shop']);
      }
    });
  }

  fetchPaymentUrl(orderId: string) {
    this.loading.set(true);
    this.storeService.createPaymentForOrder(orderId).subscribe({
      next: (res: any) => {
        if (res.success && res.iframeUrl) {
          this.iframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(res.iframeUrl));
        } else {
          this.alertService.show('عذراً، لم نتمكن من جلب رابط الدفع', 'error');
          this.router.navigate(['/shop/checkout']);
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Payment error:', err);
        this.alertService.show('فشل في بدء عملية الدفع الإلكتروني', 'error');
        this.loading.set(false);
        this.router.navigate(['/shop/checkout']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/shop/checkout']);
  }
}
