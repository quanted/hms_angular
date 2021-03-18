import { Injectable } from '@angular/core';
import { HttpRequest,  HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpHeadersInterceptor implements HttpInterceptor {
  constructor() {}
  
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.body) {
      // I initially thought that this needed to be set on POST requests,
      // but it turns out that setting this breaks the request because the endpoint only accepts a string.
      // request = request.clone({ setHeaders: { 'Content-Type': 'application/json' } });
    }
    return next.handle(request)
  }
}
