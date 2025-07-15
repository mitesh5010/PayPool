import { Component, computed, inject } from '@angular/core';
import { LoadingService } from '../../Service/loading.service';

@Component({
  selector: 'app-global-loading',
  imports: [],
  template:`@if (loading()) {
    <div class="loading-overlay">
      <img src="../../../assets/bg-paypool.png" class="logo-pulse" alt="Loading..." />
    </div>
  }`,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255,255,255,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .logo-pulse {
      width: 150px;
      height: 150px;
      animation: pulse 1.2s infinite ease-in-out;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
    `]
})
export class GlobalLoadingComponent {
  private loadingService = inject(LoadingService);
  loading = computed(() => this.loadingService.isLoading());
}
