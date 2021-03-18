import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class HmsService {
  headers: HttpHeaders;

  constructor(
      private http: HttpClient,
  ) {}

  getSwagger(): Observable<any>{
    return this.http.get("https://ceamdev.ceeopdev.net/hms/api_doc/swagger/");
  }

  // test requests ---------------------------------------------------------------------------
  testGet(): Observable<any> {
    return this.http.get('https://ceamdev.ceeopdev.net/hms/rest/api/water-quality/solar/run')
    .pipe(
      catchError((err) => {
        return of({ error: `Failed to fetch dataset solar data!\n`, err });
      })
    );
  }

  testPost(request): Observable<any> {
    if (request) {
      return this.http.post('https://ceamdev.ceeopdev.net/hms/rest/api/hydrology/streamflow', JSON.stringify(request))
      .pipe(
        catchError((err) => {
          return of({ error: `Failed to fetch streamflow data!\n`, err });
        })
      );
    } else return throwError({ error: "empty request!" });
  }
}
