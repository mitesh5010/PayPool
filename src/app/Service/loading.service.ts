import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loadingSignal = signal<boolean>(false);

  constructor() { }
  show() {
    this.loadingSignal.set(true);
  }

  hide() {
    this.loadingSignal.set(false);
  }

  isLoading = () => this.loadingSignal();
}
