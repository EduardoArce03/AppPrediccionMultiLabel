import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { NgZone } from "@angular/core";
@Injectable({

    providedIn: 'root'
})

export class VoiceService {
    transcript = '';
    isListening = false;
    recognition: any;
    constructor(private router: Router, private ngZone: NgZone) {}

    startListening(): void {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
          console.warn('Tu navegador no soporta comandos de voz.');
          return;
        }
    
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-ES';
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        this.recognition.continuous = true;
    
        this.recognition.onresult = (event: any) => {
          const speechResult = event.results[event.results.length - 1][0].transcript.toLowerCase();
          console.log('Texto reconocido:', speechResult);
          this.handleCommand(speechResult);
        };
    
        this.recognition.onerror = (event: any) => {
          console.error('Error en el reconocimiento de voz:', event.error);
        };
    
        this.recognition.onend = () => {
          console.log('Reconocimiento finalizado.');
          this.isListening = false; // Asegurarte de actualizar el estado
        };
    
        this.recognition.start();
        this.isListening = true;
        console.log('Reconocimiento de voz activado.');
      }
    
      stopListening(): void {
        if (this.recognition) {
          this.recognition.onend = null; // Prevenir reinicio
          this.recognition.stop();
          this.isListening = false;
          console.log('Reconocimiento de voz desactivado.');
        }
      }

    private handleCommand(command: string): void {
        if (command.includes('tomar foto')) {
            this.ngZone.run(() => this.router.navigate(['/pages/cam'], { queryParams: { capture: true } }));
        } else if (command.includes('predecir')) {
            this.ngZone.run(() => this.router.navigate(['/pages/cam'], { queryParams: { predict: true } }));
        } else if (command.includes('tomar foto y predecir')) {
            this.ngZone.run(() => this.router.navigate(['/pages/cam'], { queryParams: { capture: true, predict: true } }));
        }else if (command.includes('predicciones con cámara') || command.includes('predicción con cámara')
            || command.includes('cámara') || command.includes('cámaras')) {
            this.ngZone.run(() => this.router.navigate(['/pages/cam'])); // Redirige usando NgZone
        } else if (command.includes('historial de predicciones')) {
            this.ngZone.run(() => this.router.navigate(['/historial'])); // Redirige usando NgZone
        } else if (command.includes('inicio') || command.includes('principal')) {
            this.ngZone.run(() => this.router.navigate(['/'])); // Redirige usando NgZone
        } else if (command.includes('predicciones con archivo') || command.includes('predicción con archivo')
                || command.includes('archivo') || command.includes('archivos')) {
            this.ngZone.run(() => this.router.navigate(['/pages/file'])); // Redirige usando NgZone
        } else {
            console.warn('Comando no reconocido.');
        }
    }
}