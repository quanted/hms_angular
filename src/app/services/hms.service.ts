import {Injectable} from '@angular/core';

import {HttpClient, HttpHeaders} from '@angular/common/http';

import {Observable, of, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class HmsService {
  headers: HttpHeaders;

  constructor(
      private http: HttpClient,
  ) {
  }

  /**
   * POST method for submitting a single object to an endpoint and retrieving the result.
   * @param object - Input object for post request.
   */
  // post(object): Observable<any> {
  //   return this.http
  //       .post<T>(`${this.url}/${this.endpoint}`, object, this.headers);
  // }

  /**
   * GET method for retrieving a single object from an endpoint.
   * @param object - Input object for request.
   */
  // submit(object): Observable<any> {
  //   return this.http
  //       .get<T>(`${this.url}/${this.endpoint}/${object}`, {headers: this.headers});
  // }

  /**
   * GET method for retrieving a single object from an endpoint.
   */
  // info(): Observable<any> {
  //   return this.http
  //       .get<T>(`${this.url}/${this.endpoint}`, {headers: this.headers});
  // }
  getSwagger(): Observable<any>{
    return this.http.get("https://ceamdev.ceeopdev.net/hms/api_doc/swagger/");
  }

  //test requests
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
          return of({ error: `Failed to fetch dataset solar data!\n`, err });
        })
      );
    } else return throwError({ error: "empty request!" });
  }
}
