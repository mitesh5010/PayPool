import {
  Component,
  input,
  output,
  OnInit,
  OnChanges,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ApiService } from '../../../Service/api.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DividerModule } from 'primeng/divider';
import { Category, Expense, Group, User } from '../../../Service/data.model';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-add-expense-dialog',
  standalone: true,
  imports: [
    DialogModule,
    ReactiveFormsModule,
    DatePickerModule,
    SelectModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    CalendarModule,
    MultiSelectModule,
    SelectButtonModule,
    DividerModule,
    CheckboxModule,
    CurrencyPipe
  ],
  templateUrl: './add-expense-dialog.component.html',
  styleUrls: ['./add-expense-dialog.component.css'],
  providers: [DatePipe],
})
export class AddExpenseDialogComponent implements OnInit, OnChanges {
  readonly visible = input<boolean>(false);
  readonly groups = input<Group[]>([]);
  readonly preSelectedGroupId = input<number | null>(null);
  readonly close = output<void>();
  readonly expenseAdded = output<Expense>();

  newExpense!: FormGroup;
  categories: Category[] = [];
  groupMembers: User[] = [];

  readonly splitOptions = [
    { label: 'Equally', value: 'equal' },
    { label: 'Manually', value: 'manual' },
  ];
  totalAmount = signal<number | null>(null);
  

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['preSelectedGroupId'] && this.preSelectedGroupId()) {
      this.updateGroupMembers(this.preSelectedGroupId()!);
      this.newExpense
        .get('selectedGroup')
        ?.setValue(this.preSelectedGroupId(), { emitEvent: false });
    }
  }

  private initializeForm(): void {
    this.newExpense = this.fb.group({
      description: ['', Validators.required],
      date: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      selectedGroup: [this.preSelectedGroupId() ?? null, Validators.required],
      splitType: ['equal'],
      selectedCategory: ['', Validators.required],
      members: this.fb.array([]),
    });

    this.newExpense
      .get('selectedGroup')
      ?.valueChanges.subscribe((groupId: number) => {
        this.updateGroupMembers(groupId);
      });
      
    // Watch for amount changes
    this.newExpense.get('amount')?.valueChanges.subscribe(amount => {
      this.totalAmount.set(amount);
      this.updateSplitAmounts();
    });

    // Watch for split type changes
    this.newExpense.get('splitType')?.valueChanges.subscribe(() => {
      this.updateSplitAmounts();
    });

  }
  private updateSplitAmounts(): void {
  if (this.newExpense.get('splitType')?.value === 'equal') {
    this.calculateEqualSplit();
  }else {
      this.enableManualInputs();
    }
  }
  private enableManualInputs(): void {
    this.membersFormArray.controls.forEach(control => {
      const selected = control.get('selected')?.value;
      if (selected) {
        control.get('amount')?.enable();
      } else {
        control.get('amount')?.setValue(0);
        control.get('amount')?.disable();
      }
    });
  }
  private initializeMembersArray(): void {
  const membersArray = this.membersFormArray;
  membersArray.clear();

  this.groupMembers.forEach(member => {
    const memberGroup = this.fb.group({
      selected: [false],
      id: [member.id],
      name: [member.name],
      email: [member.email],
      amount: [{ value: 0, disabled: true }],
    });

    memberGroup.get('selected')?.valueChanges.subscribe(() => {
      this.updateSplitAmounts();
    });

    membersArray.push(memberGroup);
  });

  this.updateSplitAmounts();
}
  private calculateEqualSplit(): void {
  const totalAmount = this.newExpense.get('amount')?.value;
  const selectedMembers = this.membersFormArray.controls
    .filter(control => control.get('selected')?.value);
  
  if (!totalAmount || selectedMembers.length === 0) {
    this.membersFormArray.controls.forEach(control => {
      control.get('amount')?.setValue(0);
      control.get('amount')?.disable();
    });
    return;
  }

   const baseAmount = Math.floor((totalAmount / selectedMembers.length) * 100) / 100;
    const remainder = Math.round((totalAmount - (baseAmount * selectedMembers.length)) * 100);
    
    this.membersFormArray.controls.forEach((control, index) => {
      if (control.get('selected')?.value) {
        const amount = index < remainder ? baseAmount + 0.01 : baseAmount;
        control.get('amount')?.setValue(amount);
        control.get('amount')?.disable();
      } else {
        control.get('amount')?.setValue(0);
        control.get('amount')?.disable();
      }
    });
}

  validateSplit(): boolean {
    if (this.newExpense.get('splitType')?.value === 'equal') return true;

    const membersArray = this.membersFormArray;
    const totalSplit = membersArray.controls
      .filter(control => control.get('selected')?.value)
      .reduce((sum, control) => sum + (control.get('amount')?.value || 0), 0);

    return Math.abs(totalSplit - this.totalAmount()!) < 0.01; // Allow for floating point precision
  }

  private loadCategories(): void {
    this.api.getCategories().subscribe((categories: Category[]) => {
      this.categories = categories;
    });
  }

  private updateGroupMembers(groupId: number): void {
    const selectedGroup = this.groups().find((g) => g.id === groupId);
    this.groupMembers = selectedGroup?.members || [];
    console.log('Group members:', this.groupMembers);
    this.initializeMembersArray();
  }
  get membersFormArray(): FormArray {
    return this.newExpense.get('members') as FormArray;
  }

  selectedGroupName = computed(() => {
    return this.groups().find((g: Group) => g.id === this.preSelectedGroupId())
      ?.name;
  });
  

  onSubmit(): void {
    console.log('Submit triggered');
    if (this.newExpense.invalid) {
      console.warn('Form invalid:', this.newExpense.value);
      return;
    }

    const formValue = this.newExpense.value;
    const formattedDate =
      this.datePipe.transform(formValue.date, 'MMM d y') || '';
    const groupId = formValue.selectedGroup || this.preSelectedGroupId();
    const selectedMembers = this.membersFormArray.controls
      .filter((control) => control.get('selected')?.value)
      .map((control) => ({
        id: control.get('id')?.value,
        email: control.get('email')?.value,
        amount: control.get('amount')?.value,
      }));
    if (selectedMembers.length === 0) {
      alert('No members selected');
      return;
    }

    const expense: Expense = {
      selectedGroup: this.groups().find((g) => g.id === groupId)?.name || '',
      description: formValue.description,
      amount: formValue.amount,
      date: formattedDate,
      category:
        this.categories.find((c) => c.id === formValue.selectedCategory)
          ?.category || '',
      splitType: formValue.splitType,
      splitDetails: selectedMembers,
    };

    this.api.addExpense(expense).subscribe({
      next: () => {
        this.expenseAdded.emit(expense);
        this.resetForm();
      },
      error: (error) => console.error('Error adding expense:', error),
    });
  }

  onClose(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.newExpense.reset({
      splitType: 'equal',
      selectedGroup: this.preSelectedGroupId() ?? null,
    });

    if (this.preSelectedGroupId()) {
      this.updateGroupMembers(this.preSelectedGroupId()!);
    }
    this.totalAmount.set(null);

    this.close.emit();
  }
}
