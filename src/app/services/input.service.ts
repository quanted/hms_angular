import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http"

@Injectable({
  providedIn: 'root'
})
export class InputService {
  
  constructor(private http: HttpClient) { } 

  getInputs() {
    return this.http.get("https://qed.epacdx.net/hms/api_doc/swagger/")
  }

}