/**
 * HttpInterceptor for catching errors from client side requests and server side responses.
 */

import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
        .pipe(
            catchError((error: HttpErrorResponse) => {
              let errorMsg: string;
              if (error.error instanceof ErrorEvent) {
                console.log('Client side error');
                errorMsg = `Error: ${error.error.message}`;
              }
              else {
                console.log('Server side error');
                errorMsg = `Error Code: ${error.status},  Message: ${error.message}`;
              }
              console.log(errorMsg);
              return throwError(errorMsg);
            })
        );
  }
}
