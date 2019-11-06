import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';

import { Subject, Observable, throwError } from 'rxjs';

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { catchError } from 'rxjs/operators';

import { MWarehouse, MWarehouseBin, MArticle } from 'app/model/warehouse-master-model';
import { OutboundWithItemView, GRNWithItemView } from 'app/model/warehouse-transaction-model';

@Injectable({
    providedIn: 'root'
})
export class WarehouseTransactionService {

    baseAddress: string;
    constructor(private _httpClient: HttpClient, private _authService: AuthService) {
        this.baseAddress = _authService.baseAddress;
    }

    // Error Handler
    errorHandler(error: HttpErrorResponse): Observable<string> {
        return throwError(error.error || error.message || 'Server Error');
    }

    // GRN
    CreateGRN(grn: GRNWithItemView): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/WarehouseTransaction/CreateGRN`,
            grn,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }
    //

    // Outbound
    CreateOutbound(Outbound: OutboundWithItemView): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}api/WarehouseTransaction/CreateOutbound`,
            Outbound,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }
    //

    // Warehouse
    // CreateWarehouse(warehouse: MWarehouse): Observable<any> {
    //     return this._httpClient.post<any>(`${this.baseAddress}api/WarehouseMaster/CreateWarehouse`,
    //         warehouse,
    //         {
    //             headers: new HttpHeaders({
    //                 'Content-Type': 'application/json'
    //             })
    //         })
    //         .pipe(catchError(this.errorHandler));
    // }

    // GetAllWarehouses(): Observable<MWarehouse[] | string> {
    //     return this._httpClient.get<MWarehouse[]>(`${this.baseAddress}api/WarehouseMaster/GetAllWarehouses`)
    //         .pipe(catchError(this.errorHandler));
    // }

    // UpdateWarehouse(warehouse: MWarehouse): Observable<any> {
    //     return this._httpClient.post<any>(`${this.baseAddress}api/WarehouseMaster/UpdateWarehouse`,
    //         warehouse,
    //         {
    //             headers: new HttpHeaders({
    //                 'Content-Type': 'application/json'
    //             })
    //         })
    //         .pipe(catchError(this.errorHandler));
    // }

    // DeleteWarehouse(warehouse: MWarehouse): Observable<any> {
    //     return this._httpClient.post<any>(`${this.baseAddress}api/WarehouseMaster/DeleteWarehouse`,
    //         warehouse,
    //         {
    //             headers: new HttpHeaders({
    //                 'Content-Type': 'application/json'
    //             })
    //         })
    //         .pipe(catchError(this.errorHandler));
    // }


}
