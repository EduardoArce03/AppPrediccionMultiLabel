import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CamComponent } from './cam.component';
@NgModule({
	imports: [RouterModule.forChild([
		{ path: '', component: CamComponent }
	])],
	exports: [RouterModule]
})
export class CamRoutingModule { }