import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, tap } from "rxjs";
import { environment } from "src/environments/environment";
@Injectable()
export class AuthService {

    private isAuthenticated = new BehaviorSubject<boolean>(this.checkLoggedIn());

    public isAuthenticated$ = this.isAuthenticated.asObservable();

    constructor(private http:HttpClient, private router : Router) { }

    login(email: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/login`, { email, password }).pipe(
            tap((response) => {
                localStorage.setItem('user', JSON.stringify(response.user));
                this.isAuthenticated.next(true);
                setTimeout(() => {
                    
                    window.location.reload();
                    
                    
                }
                , 10);
                this.router.navigate(['/']);
                
            })
        );
    }

    register(name: string, email: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}/register`, { name, email, password });
    }

    logout() {
        localStorage.removeItem('user');
        this.isAuthenticated.next(false);
    }

    checkLoggedIn(): boolean {
        return !!localStorage.getItem('user');
    }

    getUser(){
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

}