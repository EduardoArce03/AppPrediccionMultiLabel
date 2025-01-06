import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { PredictService } from 'src/app/demo/service/predict.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/demo/service/auth.service';

@Component({
  selector: 'app-cam',
  templateUrl: './cam.component.html',
  styleUrl: './cam.component.scss'
})

export class CamComponent {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  capturedImage: string | null = null;
  facingMode: 'user' | 'environment' = 'user'; // Controlar la cámara activa
  stream: MediaStream | null = null;
  predictions: string[] = [];
  audio_Url: string = '';
  capturedPhoto: boolean = false;
  predict: boolean = false;
  visible: boolean = false;
  playAud: boolean = false;
  progress: number = 0;
  interval = null;
  sizes!: any[];
  selectedSize: any = '';
  useRearCamera = true;

  constructor(private predictionService: PredictService, private message: MessageService, private cdr: ChangeDetectorRef,
    private route: ActivatedRoute, private auth: AuthService
  ) { }

  ngAfterViewInit(): void {
    // Acceder a la cámara
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: this.useRearCamera ? 'environment' : 'user', // Cambiar entre trasera y frontal
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    }).then((stream) => {
      this.videoElement.nativeElement.srcObject = stream;
    }).catch((error) => {
      console.error('Error al acceder a la cámara:', error);
    });

    this.verifyAuthState();
  }

  // Iniciar la cámara con la configuración actual
  startCamera(): void {
    const constraints = {
      video: { facingMode: this.facingMode },
    };
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: this.useRearCamera ? 'environment' : 'user',
      },
    }).then(stream => {
      this.videoElement.nativeElement.srcObject = stream;
    }).catch(error => {
      console.error('Error al acceder a la cámara:', error);
    });

  }

  // Alternar entre cámara frontal y trasera
  toggleCamera() {
    this.useRearCamera = !this.useRearCamera;

    // Detener el flujo actual antes de iniciar uno nuevo
    this.stopCurrentStream();

    // Esperar un poco para asegurar que la cámara anterior se haya detenido
    setTimeout(() => {
      this.initCamera();
    }, 500); // Esperar 500ms antes de intentar iniciar la nueva cámara
  }

  // Método para detener el flujo actual
  stopCurrentStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
      this.stream = null; // Limpiar referencia al flujo
    }
  }

  initCamera() {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      const desiredDeviceId = this.useRearCamera
        ? videoDevices.find((device) => device.label.toLowerCase().includes('back'))?.deviceId
        : videoDevices.find((device) => device.label.toLowerCase().includes('front'))?.deviceId;

      if (desiredDeviceId) {
        navigator.mediaDevices
          .getUserMedia({
            video: { deviceId: { exact: desiredDeviceId } },
          })
          .then((stream) => {
            this.stream = stream; // Guardar el nuevo flujo
            this.videoElement.nativeElement.srcObject = stream;

            // Revisar si el flujo de la cámara está listo para mostrar
            this.videoElement.nativeElement.onloadedmetadata = () => {
              console.log('La cámara está lista');
              this.videoElement.nativeElement.play();
            };
          })
          .catch((error) => {
            console.error('Error al acceder a la cámara:', error);
          });
      } else {
        console.error('No se encontró la cámara deseada.');
      }
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
    this.route.queryParams.subscribe(params => {
      if (params['capture']) {
        this.capturedPhoto = true;
        this.capturePhoto();
      }
      if (params['predict']) {
        this.predict = true;
        this.predictImage();
        setTimeout(() => {
          this.playAudio(this.audio_Url);
        }, 2000);
      }

    });
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
          this.audio_Url = response.audio_url;
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

  playAudio(audioUrl: string): void {
    const audio = new Audio(audioUrl);
    audio.play();
    console.log("xd", audioUrl);
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

  verifyAuthState(): void {
    if (!this.auth.checkLoggedIn()) {
      this.message.add({ severity: 'info', summary: 'Advertencia', detail: 'Estimado usuario, para poder realizar predicciones debe iniciar sesion.' });
    }
  }
}