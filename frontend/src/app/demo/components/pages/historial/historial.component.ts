import { Component, OnInit } from '@angular/core';
import { PredictionService } from 'src/app/demo/service/prediction.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.scss'
})
export class HistorialComponent implements OnInit {

  userId: any;

  recentPredictions: any[] = [];

  constructor(private predictionService: PredictionService) { }

  ngOnInit(): void {
    this.loadRecentPredictions();
  }

  loadRecentPredictions() {
    this.userId = localStorage.getItem('user');
    if (this.userId) {
      const parsedUser = JSON.parse(this.userId); // Convertir de JSON a objeto
      const userId = parsedUser.id; // Extraer el campo `id`
      this.predictionService.getPredictions(userId).subscribe(
        (data) => {
          this.recentPredictions = data.predictions;
        },
        (error) => {
          console.error('Error fetching recent predictions:', error);
        }
      );
    }
  }

  generateReport(prediction: any): void {
    const doc = new jsPDF();
  
    // ** Encabezado estilizado **
    doc.setFillColor(63, 81, 181); // Azul
    doc.rect(0, 0, 210, 30, 'F'); // Rectángulo lleno
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255); // Blanco
    doc.text('Reporte de Predicción', 10, 20);
  
    // ** Información principal **
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Negro
    doc.text(`Usuario: ${prediction.nombre}`, 10, 50);
    doc.text(`Fecha: ${prediction.timestamp}`, 10, 60);
    doc.text(`Predicción: ${prediction.predictions}`, 10, 70);
  
    // ** Línea divisoria **
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200); // Gris claro
    doc.line(10, 80, 200, 80);
  
    // ** Imagen centrada **
    if (prediction.image_url) {
      const img = new Image();
      img.src = prediction.image_url;
  
      img.onload = () => {
        const pageWidth = doc.internal.pageSize.getWidth(); // Ancho total del PDF
        const imgWidth = 50; // Ancho deseado de la imagen
        const imgHeight = 50; // Alto deseado de la imagen
        const centerX = (pageWidth - imgWidth) / 2; // Calcular posición centrada
  
        doc.addImage(img, 'JPEG', centerX, 90, imgWidth, imgHeight);
  
        // ** Tabla de detalles adicionales **
        autoTable(doc, {
          startY: 150,
          head: [['Campo', 'Valor']],
          body: [
            ['Usuario', prediction.nombre],
            ['Fecha', prediction.timestamp],
            ['Predicción', prediction.predictions],
          ],
        });
  
        // Guardar el PDF
        doc.save(`reporte_${prediction.nombre}.pdf`);
      };
    } else {
      // ** Tabla de detalles adicionales (sin imagen) **
      autoTable(doc, {
        startY: 90,
        head: [['Campo', 'Valor']],
        body: [
          ['Usuario', prediction.nombre],
          ['Fecha', prediction.timestamp],
          ['Predicción', prediction.predictions],
        ],
      });
  
      // Guardar el PDF
      doc.save(`reporte_${prediction.nombre}.pdf`);
    }
  }
}
