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
      private url: string,
      private endpoint: string
  ) {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Token ${this.cookieService.get('TOKEN')}`
    });
  }

  /**
   * POST method to create a new object of a given type.
   * @param object - The model object being created and returned.
   */
  create(object: T): Observable<T> {
    return this.httpClient
        .post<T>(`${this.url}/${this.endpoint}`, object, {headers: this.headers});
  }

  /**
   * GET method for retrieving a list of objects from an endpoint.
   */
  getAll(): Observable<T[]> {
    return this.httpClient
        .get<T[]>(`${this.url}/${this.endpoint}`, {headers: this.headers});
  }

  /**
   * GET method for retrieving a single object from an endpoint.
   * @param id - The ID of the object to get.
   */
  get(id: number): Observable<T> {
    return this.httpClient
        .get<T>(`${this.url}/${this.endpoint}/${id}`, {headers: this.headers});
  }

  /**
   * PUT method to update an object of a given type.
   * @param id - The ID of the object being updated.
   * @param object - The model object being created and returned.
   */
  update(id: number, object: T): Observable<T> {
    return this.httpClient
        .put<T>(`${this.url}/${this.endpoint}/${id}`, object, {headers: this.headers});
  }

  /**
   * DELETE method to delete an object of a given type.
   * @param id - The ID of the object being deleted.
   */
  delete(id: number): Observable<T> {
    return this.httpClient
        .delete<T>(`${this.url}/${this.endpoint}/${id}`, {headers: this.headers});
  }
}
