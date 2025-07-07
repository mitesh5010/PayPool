import {
  Component,
  effect,
  input,
  OnInit,
  output,
  computed,
  signal,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
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
    MultiSelectModule,
  ],
  templateUrl: './add-expense-dialog.component.html',
  styleUrl: './add-expense-dialog.component.css',
  providers: [DatePipe],
})
export class AddExpenseDialogComponent implements OnInit, OnChanges {
  newExpense!: FormGroup;
  visible = input<boolean>(false);
  groups = input<Group[]>([]);
  categories!: Category[];
  preSelectedGroupId = input<number | null>();
  selectedGroupId = signal<number | null>(null);
  groupMembers: User[] = [];
  close = output<void>();
  expenseAdded = output<Expense>();
  splitOptions = [
    { label: 'Equally', value: 'equal' },
    { label: 'Manually', value: 'manual' },
  ];

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private api: ApiService
  ) {}
  ngOnInit(): void {
    this.api.getCategories().subscribe((categories: Category[]) => {
      this.categories = categories;
    });
    this.newExpense = this.fb.group({
      description: ['', Validators.required],
      date: ['', Validators.required],
      amount: [null, Validators.required],
      selectedGroup: [this.preSelectedGroupId() ?? null, Validators.required],
      splitType: ['equal'],
      selectedMembers: [[], Validators.required],
      selectedCategory: ['', Validators.required],
    });

    this.newExpense
      .get('selectedGroup')
      ?.valueChanges.subscribe((groupId: number) => {
        const selectedGroup = this.groups().find((g) => g.id === groupId);
        this.groupMembers = selectedGroup?.members || [];
        this.newExpense.get('splitType')?.setValue('');
      });
      if (this.preSelectedGroupId() != null) { // Check for null or undefined
      this.updateGroupMembers(this.preSelectedGroupId() as number | null);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['preSelectedGroupId'] && this.preSelectedGroupId()!= null) {
      this.updateGroupMembers(this.preSelectedGroupId() as number | null);
      this.newExpense.get('selectedGroup')?.setValue(this.preSelectedGroupId(), { emitEvent: false });
    }
  }
  private updateGroupMembers(groupId: number | null): void {
    const selectedGroup = this.groups().find((g) => g.id === groupId);
    this.groupMembers = selectedGroup?.members || [];
    this.newExpense.get('selectedMembers')?.setValue([]); // Reset selected members when group changes
    
  }
  selectedGroupName = computed(() => {
    return this.groups().find((g: Group) => g.id === this.preSelectedGroupId())
      ?.name;
  });

  onSubmit() {
    if (this.newExpense.valid) {
      const formValue = this.newExpense.value;

      const formattedDate = this.datePipe.transform(formValue.date, 'MMM d y');

      const expense: Expense = {
        selectedGroup:
          this.groups().find(
            (g) =>
              g.id === (formValue.selectedGroup || this.preSelectedGroupId())
          )?.name || '',
        description: formValue.description,
        amount: formValue.amount,
        date: formattedDate || '',
        category:
          this.categories.find((c) => c.id === formValue.selectedCategory)
            ?.category || '',
        splitType: formValue.splitType,
        selectedMembers: formValue.selectedMembers.map((member: User) => ({
          name: member.name,
          email: member.email,
        })),
      };
      this.api.addExpense(expense).subscribe({
        next: (response) => {
          console.log('Expense added successfully:', response);
          this.expenseAdded.emit(expense);
          this.close.emit();
          this.newExpense.reset();
        },
        error: (error) => {
          console.error('Error adding expense:', error);
        },
      });
    }
  }
  onClose() {
    this.close.emit();
    this.newExpense.reset();
    if (this.preSelectedGroupId()) {
      this.updateGroupMembers(this.preSelectedGroupId() as number | null);
    }
  }
}
