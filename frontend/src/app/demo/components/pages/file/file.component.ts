import { Component, ChangeDetectorRef } from '@angular/core';
import { PredictService } from 'src/app/demo/service/predict.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss']
})
export class FileComponent {
  predictions: string[] = [];
  visible: boolean = false;
  progress: number = 0;
  interval = null;

  constructor(private predictionService: PredictService, private message: MessageService, private cdr: ChangeDetectorRef) { }

  // Este método se llama cuando el archivo se sube
  onFileUpload(event: any): void {
    this.showConfirm();

    const file = event.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const fileData = reader.result as string;
      
      // Llamamos al servicio para hacer la predicción con la imagen cargada
      this.predictionService.predictImage(fileData).subscribe(
        (response) => {
          this.predictions = response.predictions;  // Las predicciones vienen del backend
          console.log('Predicciones:', this.predictions);
          this.showSuccess();
          this.showInfo();
          this.onClose();
        },
        (error) => {
          console.error('Error al predecir:', error);
          this.showError();
        }
      );
    };

    reader.readAsDataURL(file); // Convertir archivo a base64
  }

  // Mostrar éxito cuando las predicciones se hacen correctamente
  showSuccess() {
    this.message.add({ severity: 'success', summary: 'Success', detail: 'Predicciones realizadas con éxito!' });
  }

  // Mostrar información sobre las predicciones
  showInfo() {
    this.message.add({ severity: 'info', summary: 'Info', detail: 'Revisar las predicciones en la sección 2' });
  }

  // Mostrar error si ocurre un problema en la predicción
  showError() {
    this.message.add({ severity: 'error', summary: 'Error', detail: 'Error al predecir' });
  }

  // Manejar el progreso de la carga del archivo
  showConfirm() {
    if (!this.visible) {
      this.message.add({ key: 'confirm', sticky: true, severity: 'custom', summary: 'Subiendo tu imagen...' });
      this.visible = true;
      this.progress = 0;

      if (this.interval) {
        clearInterval(this.interval);
      }

      this.interval = setInterval(() => {
        if (this.progress <= 100) {
          this.progress = this.progress + 20;
        }

        if (this.progress >= 100) {
          this.progress = 100;
          clearInterval(this.interval);
        }
        this.cdr.markForCheck();
      }, 1000);
    }
  }

  // Cerrar la notificación
  onClose() {
    this.visible = false;
    this.message.clear('confirm');
  }

  speakText(text: string) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    synth.speak(utterance);
  }
  
}
