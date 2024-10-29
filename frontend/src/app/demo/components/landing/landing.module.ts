import { NgModule } from '@angular/core';
import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';


@NgModule({
    imports: [
        LandingRoutingModule,
        CommonModule,
        ButtonModule,
        FormsModule,
        InputTextModule
    ],
    declarations: [LandingComponent]
})
export class LandingModule { }