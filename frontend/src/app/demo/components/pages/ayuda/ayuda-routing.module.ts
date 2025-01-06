import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AyudaComponent } from './ayuda.component';
@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: AyudaComponent }
    ])],
    exports: [RouterModule]
})
export class AyudaRoutingModule { }