import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { VoiceService } from './demo/service/voice.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    transcript = '';
    constructor(private primengConfig: PrimeNGConfig, private commandService : VoiceService) { }

    ngOnInit() {
        this.primengConfig.ripple = true;
        this.commandService.startListening();

        this.transcript = this.commandService.transcript;
    }
}
