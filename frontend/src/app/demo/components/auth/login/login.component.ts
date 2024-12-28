import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent {

    valCheck: string[] = ['remember'];

    password!: string;

    loginForm: FormGroup;

    passwordVisible = false;
    
    constructor(public layoutService: LayoutService, private authService : AuthService, private fb : FormBuilder, private router: Router) {
        this.loginForm = this.fb.group({
            email: [''],
            password: ['']
        });
     }

     login(){
        const { email, password } = this.loginForm.value;

        this.authService.login(email, password).subscribe({
            next: () => {
                console.log('Login success');
                //this.router.navigate(['/']);
            },
            error: (err) => {
                console.error(err);
            }
        });
     }
    
}
