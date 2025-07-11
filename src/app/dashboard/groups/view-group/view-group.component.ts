import { Component, computed, effect, input, OnInit, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Dialog } from "primeng/dialog";
import { Group } from '../../../Service/data.model';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-view-group',
  imports: [Dialog,ButtonModule,TabsModule, AvatarModule],
  templateUrl: './view-group.component.html',
  styleUrl: './view-group.component.css'
})
export class ViewGroupComponent implements OnInit {
   readonly visible = input<boolean>(false);
   readonly close = output<void>();
   readonly groups = input<Group[]>([]);
   readonly groupId = input<number | null>(null);
   viewGroup =signal<Group | null>(null);

   tabs: { value: number, title: string }[] = [];

   constructor() {
    effect(() => {
      this.viewGroup.set(this.selectedGroup());
    });
  }

   ngOnInit(): void {
     this.tabs = [
       { value: 1, title: 'Overview'},
       { value: 2, title: 'Members' },
       { value: 3, title: 'Expenses'}
     ];
   }

   selectedGroup = computed(()=>{
    if (!this.groupId()) {
        return null;
      }
    return this.groups().find(group => group.id === this.groupId()) || null;
   })

  onClose() {
    this.close.emit();
  }

}
