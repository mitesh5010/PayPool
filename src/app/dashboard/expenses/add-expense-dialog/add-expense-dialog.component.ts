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
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';

import { ApiService } from '../../../Service/api.service';
import { Category, Expense, Group, User } from '../../../Service/data.model';
import { distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';

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
    CurrencyPipe,
  ],
  templateUrl: './add-expense-dialog.component.html',
  styleUrls: ['./add-expense-dialog.component.css'],
  providers: [DatePipe],
})
export class AddExpenseDialogComponent implements OnInit, OnChanges {
  // Inputs & Outputs
  readonly visible = input<boolean>(false);
  readonly groups = input<Group[]>([]);
  readonly preSelectedGroupId = input<number | null>(null);
  readonly close = output<void>();
  readonly expenseAdded = output<Expense>();

  // Form & Data
  newExpense!: FormGroup;
  categories: Category[] = [];
  groupMembers: User[] = [];
  userId!:number;

  readonly splitOptions = [
    { label: 'Equally', value: 'equal' },
    { label: 'Manually', value: 'manual' },
  ];

  totalAmount = signal<number | null>(null);

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private api: ApiService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
    this.userId = this.auth.getUserId();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue === true) {
    // Reset form when dialog becomes visible
    this.initializeForm();
  }
    
    if (changes['preSelectedGroupId'] && this.newExpense) {
      const newGroupId = this.preSelectedGroupId();
      if (newGroupId) {
        this.newExpense.get('selectedGroup')?.setValue(newGroupId, { emitEvent: false });
        this.updateGroupMembers(newGroupId);
      }
    }
  }

  // Form Initialization 
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
    if (this.preSelectedGroupId()) {
    this.updateGroupMembers(this.preSelectedGroupId()!);
  }

    this.subscribeToFormChanges();
  }

  private subscribeToFormChanges(): void {
    this.newExpense.get('selectedGroup')?.valueChanges.subscribe((groupId: number) => {
      this.updateGroupMembers(groupId);
    });

    this.newExpense.get('amount')?.valueChanges.subscribe((amount: number) => {
      this.totalAmount.set(amount);
      this.updateSplitAmounts();
    });

    this.newExpense.get('splitType')?.valueChanges.subscribe(() => {
      this.updateSplitAmounts();
    });
  }

  // --- Computed ---
  selectedGroupName = computed(() => {
    return this.groups().find(g => g.id === this.preSelectedGroupId())?.name ?? 'Not Found';
  });

  // --- Loaders ---
  private loadCategories(): void {
    this.api.getCategories().subscribe((categories: Category[]) => {
      this.categories = categories;
    });
  }

  private updateGroupMembers(groupId: number): void {
    const selectedGroup = (this.groups()??[]).find(g => g.id === groupId);
    this.groupMembers = selectedGroup?.members ?? [];
    this.initializeMembersArray();
  }

  private initializeMembersArray(): void {
     this.membersFormArray.clear();

    this.groupMembers.forEach(member => {
      console.log(member);
      
      const memberGroup = this.fb.group({
        selected: [true],
        id: [member.id],
        name: [member.name],
        email: [member.email],
        amount: [{ value: 0, disabled: true }],
      });

      memberGroup.get('selected')?.valueChanges
    .pipe(distinctUntilChanged()) 
    .subscribe(() => this.updateSplitAmounts());

      this.membersFormArray.push(memberGroup);
    });
    
    this.updateSplitAmounts();
  }

  get membersFormArray(): FormArray {
    return (this.newExpense?.get('members') as FormArray) ?? this.fb.array([]);
  }

  // --- Split Logic ---
   updateSplitAmounts(): void {

    if (this.newExpense.get('splitType')?.value === 'equal') {
      this.calculateEqualSplit();
    } else {
      this.enableManualInputs();
    }
    const totalAmount = this.newExpense.get('amount')?.value;
     if (!totalAmount) {
    this.membersFormArray.controls.forEach(control => {
      control.get('amount')?.setValue(0);
      control.get('amount')?.disable();
    });
    return;
  }
  }

  private calculateEqualSplit(): void {
    const totalAmount = this.totalAmount();
    const selectedMembers = this.membersFormArray.controls.filter(c => c.get('selected')?.value);

    if (!totalAmount || selectedMembers.length === 0) {
    this.membersFormArray.controls.forEach(control => {
      const amountControl = control.get('amount');
      amountControl?.setValue(0);
      amountControl?.disable();
    });
    return;
  }

  const memberCount = selectedMembers.length;
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / memberCount);
  const remainder = totalCents % memberCount;
  let selectedIndex = 0;

  this.membersFormArray.controls.forEach(control => {
    const amountControl = control.get('amount');
    if (control.get('selected')?.value) {
      const extraCent = selectedIndex < remainder ? 1 : 0;
      amountControl?.setValue(Number(((baseCents + extraCent) / 100).toFixed(2)));
      selectedIndex++;
    } else {
      amountControl?.setValue(0);
    }
    amountControl?.disable();
  });
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

  validateSplit(): boolean {
    if (this.newExpense.get('splitType')?.value === 'equal') return true;

    const totalSplit = this.membersFormArray.controls
      .filter(control => control.get('selected')?.value)
      .reduce((sum, control) => sum + (+control.get('amount')?.value || 0), 0);

    return Math.abs(totalSplit - this.totalAmount()!) < 0.01; // Floating point tolerance
  }

  // --- Submit & Close ---
  onSubmit(): void {
    if (this.newExpense.invalid) {
      this.newExpense.markAllAsTouched();
      console.warn('Form invalid:', this.newExpense.value);
      return;
    }

    if (!this.validateSplit()) {
      alert('Split amounts do not match the total amount.');
      return;
    }

    const formValue = this.newExpense.value;
    const formattedDate = this.datePipe.transform(formValue.date, 'MMM d y') ?? '';
    const groupId = formValue.selectedGroup ?? this.preSelectedGroupId();

    const selectedMembers = this.membersFormArray.controls
      .filter(control => control.get('selected')?.value)
      .map(control => ({
        id: control.get('id')?.value,
        email: control.get('email')?.value,
        amount: control.get('amount')?.value,
      }));

    if (selectedMembers.length === 0) {
      alert('No members selected.');
      return;
    }

    const expense: Expense = {
      selectedGroup: this.groups().find(g => g.id === groupId)?.name ?? '',
      description: formValue.description,
      amount: formValue.amount,
      date: formattedDate,
      category: this.categories.find(c => c.id === formValue.selectedCategory)?.category ?? '',
      splitType: formValue.splitType,
      splitDetails: selectedMembers,
      paidBy: this.userId,
    };

    this.api.addExpense(expense).subscribe({
      next: () => {
        this.expenseAdded.emit(expense);
        this.resetForm();
      },
      error: error => console.error('Error adding expense:', error),
    });
  }

  onClose(): void {
    this.resetForm();
  }

  private resetForm(): void {
    const currentGroup = this.newExpense.get('selectedGroup')?.value;
  
  this.newExpense.reset({
    splitType: 'equal',
    selectedGroup: currentGroup,
    date: new Date()
  });

  // Force reinitialization of members
  this.membersFormArray.clear();
  if (currentGroup) {
    this.updateGroupMembers(currentGroup);
  }

  // Reset signals and form state
  this.totalAmount.set(null);
  this.newExpense.markAsPristine();
  this.newExpense.markAsUntouched();
    this.close.emit();
  }
}
