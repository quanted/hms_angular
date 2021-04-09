import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor() { }

  sessionData = [];

  updateData(data): void {
    this.sessionData = data;
  }

  getData(): any {
    return this.sessionData;
  }
}
