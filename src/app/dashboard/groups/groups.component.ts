import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import {  MenuModule } from 'primeng/menu';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';

export interface Group {
  id: number;
  name: string;
  status: 'ACTIVE' | 'SETTLED';
  members: { name: string; email: string }[];
  total: number;
  youOwe: number;
  owedToYou: number;
}

@Component({
  selector: 'app-groups',
  imports: [ButtonModule, MenuModule, CommonModule, CardModule, DividerModule, DialogModule, InputText, MultiSelectModule],
  templateUrl: './groups.component.html',
  styleUrl: './groups.component.css',
  encapsulation: ViewEncapsulation.None

})
export class GroupsComponent implements OnInit {
  groups: Group[] = [];
  showDialog = false;
  newGroup!: FormGroup;
  allMembers = [
  { name: 'John Smith', id: 1 },
  { name: 'Jane Doe', id: 2 },
  { name: 'sdferw', id: 3 },
  { name: 'fgvsdfvg', id: 4 },
  // ...add your members here
];

  constructor(private fb: FormBuilder){}

  ngOnInit() {
    // Replace with real service call
    this.groups = [
      {
        id: 1,
        name: 'Weekend Trip',
        status: 'ACTIVE',
        members: [{ name: 'A', email: '' }, { name: 'B', email: '' }],
        total: 856,
        youOwe: 142,
        owedToYou: 28
      },
      {
        id: 2,
        name: 'sunday Trip',
        status: 'SETTLED',
        members: [{ name: 'A', email: '' }, { name: 'B', email: '' }],
        total: 578,
        youOwe: 142,
        owedToYou: 236
      },
    ];
    

    this.newGroup = this.fb.group({
      name: ['', Validators.required],
    description: [''],
    members: [[], Validators.required]
    })
  }

  viewGroup(id: number) {
    // Navigate to group details
  }

  addExpense(id: number) {
    // Open add expense dialog/modal
  }
  openDialog(){
    this.showDialog = true;
  }
  submitGroup(){}
}
