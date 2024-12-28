import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment'; // Importa el entorno

@Injectable({
  providedIn: 'root'
})

export class PredictService {
  constructor(private http: HttpClient) { }
  // Método para predecir un archivo  
  predictFile(file: File): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    return this.http.post(`${environment.apiUrl}/predict`, formData);
  }
  // Método para predecir una imagen w cam
  predictImage(base64Image: string): Observable<any> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    console.log('userId', userId);
    if (!userId) {
      console.error('Usuario no autenticado.');
      return throwError(() => new Error('Usuario no autenticado.'));
    }
    const formData = new FormData();
    formData.append('image-data', base64Image);
    formData.append('user_id', userId);
    return this.http.post(`${environment.apiUrl}/predict`, formData);
  }
}