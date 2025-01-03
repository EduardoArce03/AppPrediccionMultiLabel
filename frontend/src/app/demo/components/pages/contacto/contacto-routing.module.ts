import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ContactoComponent } from './contacto.component';
@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: ContactoComponent }
	])],
	exports: [RouterModule]
})
export class CamRoutingModule { }