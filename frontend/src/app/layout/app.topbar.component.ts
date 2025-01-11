import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from "./service/app.layout.service";
import { AuthService } from '../demo/service/auth.service';
import { Router } from '@angular/router';
import { VoiceService } from '../demo/service/voice.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {

  isAuthenticated = false;

  private voiceStatusSubscription: Subscription;

  user: any = null;

  isListening = true;

  items!: MenuItem[];

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  constructor(public layoutService: LayoutService, private authService: AuthService, private router: Router,
    private voiceService: VoiceService) { }

  ngOnInit() {// Suscribirse al estado de escucha
    this.voiceStatusSubscription = this.voiceService.getListeningStatus().subscribe((status: boolean) => {
      this.isListening = status; // Actualizar el estado visual
    });
    this.authService.isAuthenticated$.subscribe((status) => {
      this.isAuthenticated = status;
      this.user = this.authService.getUser();
    });
  }

  ngOnDestroy() {
    // Desuscribirse para evitar fugas de memoria
    if (this.voiceStatusSubscription) {
      this.voiceStatusSubscription.unsubscribe();
    }
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
  toggleVoice(): void {
    if (this.voiceService.isListening) {
      this.voiceService.stopListening();
    } else {
      this.voiceService.startListening();
    }
    this.isListening = this.voiceService.isListening;
  }
}
