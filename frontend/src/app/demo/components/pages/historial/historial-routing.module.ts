import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HistorialComponent } from './historial.component';
@NgModule({
    imports: [RouterModule.forChild([
        { path: '', component: HistorialComponent }
    ])],
    exports: [RouterModule]
})
export class HistorialRoutingModule { }