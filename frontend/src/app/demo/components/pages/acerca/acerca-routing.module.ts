import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AcercaComponent } from './acerca.component';
@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: AcercaComponent }
    ])],
    exports: [RouterModule]
})
export class AcercaRoutingModule { }