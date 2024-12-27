import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Importa el entorno

@Injectable({
  providedIn: 'root'
})

export class PredictService {
  constructor(private http: HttpClient) { }
  // Método para predecir un archivo  
  predictFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${environment.apiUrl}/predict`, formData);
  }
  // Método para predecir una imagen w cam
  predictImage(base64Image: string): Observable<any> {
    const formData = new FormData();
    formData.append('image-data', base64Image);
    return this.http.post(`${environment.apiUrl}/predict`, formData);
  }
}