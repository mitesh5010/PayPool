import {
  Component,
  input,
  output,
  OnInit,
  OnChanges,
  SimpleChanges,
  computed,
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
import { DatePipe } from '@angular/common';
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
    CheckboxModule
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
      this.newExpense.get('selectedGroup')?.setValue(this.preSelectedGroupId(), { emitEvent: false });
    }
  }

  private initializeForm(): void {
    this.newExpense = this.fb.group({
      description: ['', Validators.required],
      date: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      selectedGroup: [this.preSelectedGroupId() ?? null, Validators.required],
      splitType: ['equal'],
      selectedMembers: [[], Validators.required],
      selectedCategory: ['', Validators.required],
    });

    this.newExpense.get('selectedGroup')?.valueChanges.subscribe((groupId: number) => {
      this.updateGroupMembers(groupId);
    });
  }
  

  private loadCategories(): void {
    this.api.getCategories().subscribe((categories: Category[]) => {
      this.categories = categories;
    });
  }

  private updateGroupMembers(groupId: number): void {
    const selectedGroup = this.groups().find(g => g.id === groupId);
    this.groupMembers = selectedGroup?.members || [];
    this.newExpense.get('selectedMembers')?.setValue([]);
  }

   selectedGroupName = computed(() => {
    return this.groups().find((g: Group) => g.id === this.preSelectedGroupId())
      ?.name;
  });
  
  onSubmit(): void {
    if (this.newExpense.invalid) return;

    const formValue = this.newExpense.value;
    const formattedDate = this.datePipe.transform(formValue.date, 'MMM d y') || '';
    const groupId = formValue.selectedGroup || this.preSelectedGroupId();

    const expense: Expense = {
      selectedGroup: this.groups().find(g => g.id === groupId)?.name || '',
      description: formValue.description,
      amount: formValue.amount,
      date: formattedDate,
      category: this.categories.find(c => c.id === formValue.selectedCategory)?.category || '',
      splitType: formValue.splitType,
      selectedMembers: formValue.selectedMembers.map((member: User) => ({
        id: member.id,
        name: member.name,
        email: member.email,
      })),
 
    };

    this.api.addExpense(expense).subscribe({
      next: () => {
        this.expenseAdded.emit(expense);
        this.resetForm();
      },
      error: (error) => console.error('Error adding expense:', error)
    });
  }

  onClose(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.newExpense.reset({
      splitType: 'equal',
      selectedGroup: this.preSelectedGroupId() ?? null
    });
    
    if (this.preSelectedGroupId()) {
      this.updateGroupMembers(this.preSelectedGroupId()!);
    }
    
    this.close.emit();
  }
}