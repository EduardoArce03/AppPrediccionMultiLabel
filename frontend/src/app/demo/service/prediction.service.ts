import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Esto asegura que el servicio sea accesible en toda la aplicación
})
export class PredictionService {
  // Cambia esta URL por la ruta de tu servidor backend
  private apiUrl = 'http://localhost:5000/recent-predictions'; 

  constructor(private http: HttpClient) {}

  // Función para obtener las predicciones recientes
  getRecentPredictions(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}