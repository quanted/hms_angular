/**
 * Generic http service for HMS components.
 */

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CookieService} from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root'
})
export class HttpService<T> {

  private readonly headers: HttpHeaders;

  constructor(
      private cookieService: CookieService,
      private httpClient: HttpClient,
      public url: string,
      public endpoint: string
  ) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Token ${this.cookieService.get('TOKEN')}`
    });
  }

  /**
   * POST method for submitting a single object to an endpoint and retrieving the result.
   * @param object - Input object for post request.
   */
  post(object: T): Observable<T> {
    return this.httpClient
        .post<T>(`${this.url}/${this.endpoint}`, object, {headers: this.headers});
  }

  /**
   * GET method for retrieving a single object from an endpoint.
   * @param object - Input object for request.
   */
  submit(object: T): Observable<T> {
    return this.httpClient
        .get<T>(`${this.url}/${this.endpoint}/${object}`, {headers: this.headers});
  }

  /**
   * GET method for retrieving a single object from an endpoint.
   */
  info(): Observable<T> {
    return this.httpClient
        .get<T>(`${this.url}/${this.endpoint}`, {headers: this.headers});
  }
}
