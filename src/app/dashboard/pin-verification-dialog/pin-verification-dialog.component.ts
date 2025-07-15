import { Component, Input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Dialog } from "primeng/dialog";
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-pin-verification-dialog',
  imports: [Dialog, PasswordModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './pin-verification-dialog.component.html',
  styleUrl: './pin-verification-dialog.component.css'
})
export class PinVerificationDialogComponent {
  @Input() visible = true;
  verified = output<boolean>();
  close = output<void>();
  pinForm!: FormGroup;
  constructor(private fb: FormBuilder, private auth: AuthService){
    this.pinForm = this.fb.group({
      pin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern(/^\d+$/)]]
  })}
  onPinInput(event: Event){}

  verifyPin():void{
    const value = this.pinForm.value.pin;
    const pin = parseInt(value);

    this.auth.verifyPin(this.auth.getUserId(), pin).subscribe({
      next: isValid => {
        this.verified.emit(isValid);
        this.pinForm.reset();
        console.log('valid', isValid)
      },
      error: err => {
        this.verified.emit(false);
        console.log('PIN error', err)
      }
    })
    
    console.log(pin);
    
  }

  onHide(){
    this.close.emit();
    this.pinForm.reset();
  }

}
