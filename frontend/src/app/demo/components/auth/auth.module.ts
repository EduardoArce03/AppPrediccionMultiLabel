import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthService } from '../../service/auth.service';
@NgModule({
    imports: [
        CommonModule,
        AuthRoutingModule,
    ],
    providers: [
        AuthService
    ]
})
export class AuthModule { }
