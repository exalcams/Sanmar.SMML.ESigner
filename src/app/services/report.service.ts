import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { GetDocument, DSSConfiguration, DSSInvoice, DSSStatusCount, CertificateClass, DSSErrorInvoice, UserByPlant, ErrorInvoice } from 'app/models/dss';
import { catchError } from 'rxjs/operators';
import { UserLoginHistory, LoginHistoryFilter } from 'app/models/master';
import { GateExitLogDetails, ReportFilters } from 'app/models/report';

@Injectable()
export class ReportService {
  baseUrl: string;


  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient, private _authService: AuthService) {
    this.baseUrl = _authService.baseAddress;
  }

  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error.error_description || error.error || error.message || 'Server Error');
  }
  GetAllUserLoginHistories(): Observable<UserLoginHistory[] | string> {
    return this._httpClient.get<UserLoginHistory[]>(`${this.baseUrl}api/Reports/GetAllUserLoginHistories`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllUserLoginHistoriesBasedOnDate(loginHistoryFilter: LoginHistoryFilter): Observable<UserLoginHistory[] | string> {
    return this._httpClient.post<UserLoginHistory[]>(`${this.baseUrl}api/Reports/GetAllUserLoginHistoriesBasedOnDate`,
      loginHistoryFilter,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  GetAllUserLoginHistoriesByUser(UserName: string): Observable<UserLoginHistory[] | string> {
    return this._httpClient.get<UserLoginHistory[]>(`${this.baseUrl}api/Reports/GetAllUserLoginHistoriesByUser?UserName=${UserName}`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllUserLoginHistoriesBasedOnDateByUser(loginHistoryFilter: LoginHistoryFilter): Observable<UserLoginHistory[] | string> {
    return this._httpClient.post<UserLoginHistory[]>(`${this.baseUrl}api/Reports/GetAllUserLoginHistoriesBasedOnDateByUser`,
      loginHistoryFilter,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  // Gate Exit Logs Start

  GetAllEwaybillNos(ID: number): Observable<string[] | string> {
    return this._httpClient.get<string[]>(`${this.baseUrl}api/Reports/GetAllEwaybillNos?UserID=${ID}`)
      .pipe(catchError(this.errorHandler));
  }


  GetAllGateExitLogs(ID: number): Observable<GateExitLogDetails[] | string> {
    return this._httpClient.get<GateExitLogDetails[]>(`${this.baseUrl}api/Reports/GetAllGateExitLogs?UserID=${ID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllGateExitLogsBasedOnEwaybillNoFilter(reportFilters: ReportFilters): Observable<GateExitLogDetails[] | string> {
    return this._httpClient.post<GateExitLogDetails[]>(`${this.baseUrl}api/Reports/GetAllGateExitLogsBasedOnEwaybillNoFilter`, reportFilters)
      .pipe(catchError(this.errorHandler));
  }

  GetAllGateExitLogsBasedOnPlantFilter(reportFilters: ReportFilters): Observable<GateExitLogDetails[] | string> {
    return this._httpClient.post<GateExitLogDetails[]>(`${this.baseUrl}api/Reports/GetAllGateExitLogsBasedOnPlantFilter`, reportFilters)
      .pipe(catchError(this.errorHandler));
  }


  GetAllGateExitLogsBasedOnDateFilter(reportFilters: ReportFilters): Observable<GateExitLogDetails[] | string> {
    return this._httpClient.post<GateExitLogDetails[]>(`${this.baseUrl}api/Reports/GetAllGateExitLogsBasedOnDateFilter`, reportFilters)
      .pipe(catchError(this.errorHandler));
  }
   // Gate Exit Logs End

}
