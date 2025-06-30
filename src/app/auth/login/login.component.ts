import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: '../../shared/styles/auth.css'
})
export class LoginComponent implements OnInit{

  loginForm!: FormGroup;
  showPassword= false;
  
  constructor(private fb:FormBuilder, private auth: AuthService, private router: Router){}
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password:['', [Validators.required, Validators.minLength(4)]]
    })
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(){
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const {email, password} = this.loginForm.value;
  this.auth.login(email, password).subscribe({
    next: () => {
      this.router.navigate(['/dashboard'])
    },
    error: err => alert('Login failed: ' + err.error)
  });

    console.log(this.loginForm.value);
    
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
  
}
