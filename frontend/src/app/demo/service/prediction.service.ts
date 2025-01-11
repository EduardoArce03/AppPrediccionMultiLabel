import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Importa el entorno
@Injectable({
  providedIn: 'root', // Esto asegura que el servicio sea accesible en toda la aplicación
})
export class PredictionService {

  constructor(private http: HttpClient) {}

  // Función para obtener las predicciones recientes
  getRecentPredictions(userId: String): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/recent-predictions?user_id=${userId}`);
  }

  getPredictions(userId: String): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/all-predictions?user_id=${userId}`);
  }

  getPredictionsGrafico(userId: String): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/graphic-predictions?user_id=${userId}`);
  }

  getAllPredictions(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/total-predictions`);
  }
}