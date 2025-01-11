import { Component, OnInit } from '@angular/core';
import { PredictionService } from 'src/app/demo/service/prediction.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LayoutService } from 'src/app/layout/service/app.layout.service';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.scss'
})
export class HistorialComponent implements OnInit {

  userId: any;

  recentPredictions: any[] = [];

  constructor(private predictionService: PredictionService, public layoutService: LayoutService) { }

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

    // ** Imagen de la Ruta (Logo a la Izquierda) **
    const logo = new Image();
    logo.src = `assets/layout/images/${this.layoutService.config().colorScheme === 'light' ? 'ups' : 'ups-black'}.png`;

    logo.onload = () => {
      const logoWidth = 30; // Ancho deseado del logo
      const logoHeight = 15; // Alto deseado del logo
      const logoX = 10; // Posición X para la imagen (a la izquierda)
      const logoY = 8; // Posición Y para la imagen

      // Agregar logo
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

      // ** Título al Lado Derecho del Logo **
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255); // Blanco
      const titleX = logoX + logoWidth + 5; // Posición X del título (después del logo)
      const titleY = logoY + logoHeight / 2 + 3; // Centrado verticalmente con respecto al logo
      doc.text('Reporte de Predicción', titleX, titleY);

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
    };
  }

  generateConsolidatedReport(): void {
    const doc = new jsPDF();

    // ** Encabezado estilizado **
    doc.setFillColor(63, 81, 181); // Azul
    doc.rect(0, 0, 210, 30, 'F'); // Rectángulo lleno

    // ** Imagen de la Ruta (Logo a la Izquierda) **
    const logo = new Image();
    logo.src = `assets/layout/images/${this.layoutService.config().colorScheme === 'light' ? 'ups' : 'ups-black'}.png`;

    logo.onload = () => {
      const logoWidth = 30; // Ancho deseado del logo
      const logoHeight = 15; // Alto deseado del logo
      const logoX = 10; // Posición X para la imagen (a la izquierda)
      const logoY = 8; // Posición Y para la imagen

      // Agregar logo
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

      // ** Título al Lado Derecho del Logo **
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255); // Blanco
      const titleX = logoX + logoWidth + 5; // Posición X del título (después del logo)
      const titleY = logoY + logoHeight / 2 + 3; // Centrado verticalmente con respecto al logo
      doc.text('Reporte Consolidado de Predicciones', titleX, titleY);

      // ** Configuración inicial **
      let yOffset = 40; // Espaciado inicial (debajo del encabezado)
      const lineHeight = 10; // Altura entre líneas
      const pageWidth = doc.internal.pageSize.width; // Ancho de la página
      const pageHeight = doc.internal.pageSize.height; // Altura de la página
      const marginBottom = 20; // Margen inferior

      const addPredictionToPDF = (index: number) => {
        if (index >= this.recentPredictions.length) {
          // Guardar PDF cuando todas las predicciones se hayan procesado
          doc.save('reporte_consolidado.pdf');
          return;
        }

        const prediction = this.recentPredictions[index];

        // Agregar detalles de la predicción
        const text = `Usuario: ${prediction.nombre}, Fecha: ${prediction.timestamp}, Predicción: ${prediction.predictions}`;

        // Verificar espacio en la página para texto
        if (yOffset + lineHeight > pageHeight - marginBottom) {
          doc.addPage();
          yOffset = 20; // Reiniciar espacio vertical en la nueva página
        }

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Negro
        doc.text(text, 10, yOffset);
        yOffset += lineHeight + 5; // Espaciado adicional después del texto

        // Agregar imagen si está disponible
        if (prediction.image_url) {
          const img = new Image();
          img.src = prediction.image_url;

          img.onload = () => {
            const imgWidth = 50; // Ancho de la imagen
            const imgHeight = 50; // Alto de la imagen

            // Calcular posición X para centrar la imagen
            const xCenter = (pageWidth - imgWidth) / 2;

            // Verificar espacio en la página para la imagen
            if (yOffset + imgHeight > pageHeight - marginBottom) {
              doc.addPage();
              yOffset = 20; // Reiniciar espacio vertical en la nueva página
            }

            doc.addImage(img, 'JPEG', xCenter, yOffset, imgWidth, imgHeight);
            yOffset += imgHeight + 10; // Espaciado adicional después de la imagen

            // Procesar la siguiente predicción
            addPredictionToPDF(index + 1);
          };

          img.onerror = () => {
            // Si hay error al cargar la imagen, continuar con la siguiente predicción
            addPredictionToPDF(index + 1);
          };
        } else {
          // Si no hay imagen, procesar la siguiente predicción
          addPredictionToPDF(index + 1);
        }
      };

      // Iniciar el proceso
      addPredictionToPDF(0);
    };
  }

}
