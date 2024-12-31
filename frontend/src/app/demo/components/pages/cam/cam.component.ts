import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PredictService } from 'src/app/demo/service/predict.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-cam',
  templateUrl: './cam.component.html',
  styleUrl: './cam.component.scss'
})

export class CamComponent {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  capturedImage: string | null = null;
  predictions: string[] = [];
  audio_Url: string = '';
  visible: boolean = false;
  progress: number = 0;
  interval = null;
  sizes!: any[];
  selectedSize: any = '';

  constructor(private predictionService: PredictService, private message: MessageService, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
    // Acceder a la cámara
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      this.videoElement.nativeElement.srcObject = stream;
    });
  }

  ngOnInit() {
    console.log('xd')
    this.sizes = [
      { name: 'Small', class: 'p-datatable-sm' },
      { name: 'Normal', class: '' },
      { name: 'Large', class: 'p-datatable-lg' },
    ];
    this.selectedSize = this.sizes[2];

  }

  onSizeChange() {
    console.log(this.selectedSize);
    this.cdr.detectChanges();
  }

  capturePhoto(): void {
    this.showConfirm();
    const canvas = this.canvasElement.nativeElement;
    const video = this.videoElement.nativeElement;

    // Configurar el canvas para capturar y redimensionar la imagen
    const desiredWidth = 256; // Ancho deseado
    const desiredHeight = 256; // Alto deseado
    canvas.width = desiredWidth;
    canvas.height = desiredHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, desiredWidth, desiredHeight);
      this.capturedImage = canvas.toDataURL('image/png'); // Convertir a base64
    }
  }


  predictImage(): void {
    if (this.capturedImage) {
      this.predictionService.predictImage(this.capturedImage).subscribe(
        (response) => {
          this.predictions = response.predictions;
          this.audio_Url = response.audio_url
          console.log("lol", this.audio_Url)  // Las predicciones vienen del backend
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
    }
  }

  showSuccess() {
    this.message.add({ severity: 'success', summary: 'Success', detail: 'Predicciones realizadas con exito !' });
  }

  showInfo() {
    this.message.add({ severity: 'info', summary: 'Info', detail: 'Revisar las predicciones en la sección 3' });
  }

  showError() {
    this.message.add({ severity: 'error', summary: 'Error', detail: 'Error al predecir' });
  }

  onClose() {
    this.visible = false;
    this.message.clear('confirm');
  }

  playAudio(audioUrl : string): void {
    const audio = new Audio(audioUrl);
    audio.play();
    console.log( "xd" , audioUrl);
  }
  showConfirm() {
    if (!this.visible) {
      this.message.add({ key: 'confirm', sticky: true, severity: 'custom', summary: 'Subiendo tu imagen.' });
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
}