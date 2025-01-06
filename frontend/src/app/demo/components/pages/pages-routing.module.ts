import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VoiceService } from '../../service/voice.service';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'cam', loadChildren: () => import('./cam/cam.module').then(m => m.CamModule) },
        { path: 'file', loadChildren: () => import('./file/file.module').then(m => m.FileModule) },
        { path: 'historial', loadChildren: () => import ('./historial/historial.module').then(m => m.HistorialModule) },
        { path: 'contacto', loadChildren: () => import ('./contacto/contacto.module').then(m => m.ContactoModule) },
        { path: 'voice', component: VoiceService },
        { path: 'ayuda', loadChildren: () => import('./ayuda/ayuda.module').then(m => m.AyudaModule) },
        { path: 'acerca', loadChildren: () => import('./acerca/acerca.module').then(m => m.AcercaModule) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
