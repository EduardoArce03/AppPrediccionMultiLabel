import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  valCheck: string[] = ['remember'];

  password!: string;

  registerForm: FormGroup;

  passwordVisible = false;
  
  constructor(public layoutService: LayoutService, private authService : AuthService, private fb : FormBuilder, private router: Router) {
      this.registerForm = this.fb.group({
          name: [''],
          email: [''],
          password: ['']
      });
    }

    register(){
      const { name, email, password } = this.registerForm.value;

      this.authService.register(name, email, password).subscribe({
          next: () => {
              console.log('Register success');
              this.router.navigate(['/auth/login']);
          },
          error: (err) => {
              console.error(err);
          }
      });
    }
      
}
