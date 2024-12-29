import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { AuthService } from '../demo/service/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {

    isAuthenticated = false;

    user: any = null;

    items!: MenuItem[];

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(public layoutService: LayoutService, private authService : AuthService, private router : Router) { }

    ngOnInit() {
        this.authService.isAuthenticated$.subscribe((status) => {
            this.isAuthenticated = status;
            this.user = this.authService.getUser();
        });
    }

    login() {
        console.log('Redirigiendo al formulario de inicio de sesión...');
        this.router.navigate(['/auth/login']);
        // Aquí puedes redirigir a la página de login o abrir un modal
      }
    
      register() {
        console.log('Redirigiendo al formulario de registro...');
        this.router.navigate(['/auth/register']);
      }

      logout() {
        this.authService.logout();
        this.router.navigate(['/']);
      }
}
