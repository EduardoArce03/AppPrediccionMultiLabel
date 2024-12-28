import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'cam', loadChildren: () => import('./cam/cam.module').then(m => m.CamModule) },
        { path: 'file', loadChildren: () => import('./file/file.module').then(m => m.FileModule) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
