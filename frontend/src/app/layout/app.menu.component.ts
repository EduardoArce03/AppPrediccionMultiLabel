import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [
                    { label: 'Principal', icon: 'pi pi-fw pi-home', routerLink: ['/'] }
                ]
            },
            {
                label: 'Predicciones con modelo de IA',
                items: [
                    
                    { label: 'Prediccion con camara', icon: 'pi pi-fw pi-exclamation-circle', routerLink: ['/pages/cam'] },
                    { label: 'Prediccion con archivo', icon: 'pi pi-fw pi-file', routerLink: ['/pages/file']}
                    
                ]
            },
            {
                label: 'Historico de predicciones',
                items: [
                    { label: 'Historico de predicciones', icon: 'pi pi-fw pi-calendar', routerLink: ['/pages/historial'] }
                ]
            },
            {
                label: 'Configuracion',
                items: [
                    { label: 'Configuracion', icon: 'pi pi-fw pi-cog', routerLink: ['/uikit/charts'] }
                ]
            },
            {
                label: 'Ayuda',
                items: [
                    { label: 'Ayuda', icon: 'pi pi-fw pi-question', routerLink: ['/uikit/charts'] }
                ]
            },
            {
                label: 'Reportes',
                items: [
                    { label: 'Reportes', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] }
                ]
            },
            {
                label: 'Contacto',
                items: [
                    { label: 'Contacto', icon: 'pi pi-fw pi-envelope', routerLink: ['/uikit/charts'] }
                ]
            },
            {
                label: 'Acerca de',
                items: [
                    { label: 'Acerca de', icon: 'pi pi-fw pi-info-circle', routerLink: ['/uikit/charts'] }
                ]
            },
            {
                label: 'Salir',
                items: [
                    { label: 'Salir', icon: 'pi pi-fw pi-sign-out', routerLink: ['/uikit/charts'] }
                ]
            }
        ];
    }
}
