import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-settlements',
  imports: [ButtonModule, CommonModule],
  templateUrl: './settlements.component.html',
  styleUrl: './settlements.component.css',
  encapsulation: ViewEncapsulation.None
})
export class SettlementsComponent {

   settlements = [
    {
      avatar: 'JS',
      title: 'John Smith owes you',
      source: 'Weekend Trip',
      amount: 28.50
    },
    {
      avatar: 'AB',
      title: 'You owe Alice Brown',
      source: 'Office Lunch',
      amount: -15.75
    },
    {
      avatar: 'MJ',
      title: 'Mike Johnson owes you',
      source: 'Roommates',
      amount: 420.00
    }
  ];

  // Add your click handlers here
  onRemind(settlement: any) {
    console.log('Remind', settlement);
  }

  onSettle(settlement: any) {
    console.log('Settle', settlement);
  }
}
