import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: '../../shared/styles/auth.css'
})
export class RegisterComponent implements OnInit {

  registerForm!:FormGroup;
  showPassword=false;

  constructor(private fb:FormBuilder, private router: Router, private auth: AuthService){}

  ngOnInit(): void {
    this.registerForm =this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['',[Validators.required]],
      pin: ['',[Validators.required]]
    },{validators: this.passwordMatchValidator})
  }
  passwordMatchValidator(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(){
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formData = this.registerForm.value;
    this.auth.register(formData).subscribe({
    next: () => {
      alert('Registration successful! Please log in.');
      this.router.navigate(['/login']);
    },
    error: err => alert('Registration failed: ' + err.error)
  });
    console.log('Registering user:', formData);

    this.router.navigate(['/login']);

  }

  get f() {
    return this.registerForm.controls;
  }

}
