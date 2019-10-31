import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';

import { Subject, Observable, throwError } from 'rxjs';

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { catchError } from 'rxjs/operators';

import { MWarehouse, MWarehouseBin, MArticle } from 'app/model/warehouse-master-model';

@Injectable({
    providedIn: 'root'
})
export class WarehouseMasterService {

    baseAddress: string;
    constructor(private _httpClient: HttpClient, private _authService: AuthService) {
        this.baseAddress = _authService.baseAddress;
    }

    // Error Handler
    errorHandler(error: HttpErrorResponse): Observable<string> {
        return throwError(error.error || error.message || 'Server Error');
    }

    // Warehouse
    CreateWarehouse(warehouse: MWarehouse): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/WarehouseMaster/CreateWarehouse`,
            warehouse,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    GetAllWarehouses(): Observable<MWarehouse[] | string> {
        return this._httpClient.get<MWarehouse[]>(`${this.baseAddress}api/WarehouseMaster/GetAllWarehouses`)
            .pipe(catchError(this.errorHandler));
    }

    UpdateWarehouse(warehouse: MWarehouse): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/WarehouseMaster/UpdateWarehouse`,
            warehouse,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    DeleteWarehouse(warehouse: MWarehouse): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/WarehouseMaster/DeleteWarehouse`,
            warehouse,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }
    // WarehouseBin
    CreateWarehouseBin(WarehouseBin: MWarehouseBin): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/WarehouseMaster/CreateWarehouseBin`,
            WarehouseBin,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    GetAllWarehouseBins(): Observable<MWarehouseBin[] | string> {
        return this._httpClient.get<MWarehouseBin[]>(`${this.baseAddress}api/WarehouseMaster/GetAllWarehouseBins`)
            .pipe(catchError(this.errorHandler));
    }

    UpdateWarehouseBin(WarehouseBin: MWarehouseBin): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/WarehouseMaster/UpdateWarehouseBin`,
            WarehouseBin,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    DeleteWarehouseBin(WarehouseBin: MWarehouseBin): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/WarehouseMaster/DeleteWarehouseBin`,
            WarehouseBin,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

     // Article
     CreateArticle(Article: MArticle): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/WarehouseMaster/CreateArticle`,
            Article,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    GetAllArticles(): Observable<MArticle[] | string> {
        return this._httpClient.get<MArticle[]>(`${this.baseAddress}api/WarehouseMaster/GetAllArticles`)
            .pipe(catchError(this.errorHandler));
    }

    UpdateArticle(Article: MArticle): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/WarehouseMaster/UpdateArticle`,
            Article,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    DeleteArticle(Article: MArticle): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/WarehouseMaster/DeleteArticle`,
            Article,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

}
