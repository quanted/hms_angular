import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable, of } from "rxjs";
import { timeout, catchError, tap } from "rxjs/operators";

// Base Server
const base_url = "https://ceamdev.ceeopdev.net/hms/rest/api/"

// Staging Server
//baseURL = "https://ceamstg.ceeopdev.net/hms/rest/api/"

const precipitation_url = "meteorology/precipitation/"

const temperature_url = "hydrology/temperature/"

const relative_humidity_url = "meteorology/humidity/"

const dew_point_url = "meteorology/dewpoint/"

const solar_radiation_url = "meteorology/radiation/"

const wind_url = "meteorology/wind/"

const surface_runoff_url = "hydrology/surfacerunoff/"

const subsurface_flow_url = "hydrology/subsurfaceflow/"

const soil_moisture_url = "hydrology/soilmoisture/"

const evapotranspiration_url = "hydrology/evapotranspiration/"



@Injectable({
  providedIn: 'root'
})
export class InputService {
  
  constructor(private http: HttpClient) { }
  getData(serializedInput): Observable<any> {
    console.log(serializedInput);
    let moduleURL = null;
    const options = {
      headers: new HttpHeaders({
        // Authorization: "Bearer " + this.auth.getAuthToken(),
        "Content-Type": "application/json",
      }),
    };


    if (serializedInput.module == "precipitation") {
      moduleURL = precipitation_url;
    }
    if (serializedInput.module == "temperature") {
      moduleURL = temperature_url;
    }
    if (serializedInput.module == "relative_humidity") {
      moduleURL = relative_humidity_url;
    }
    else {
      console.log("Please select a valid module")
    }


    const newInput = { ... serializedInput };
    return this.http
      .post( base_url + moduleURL, newInput )
      .pipe(
        timeout(5000),
        tap((response: any) => {
          console.log("response from HMS: " + response);
        }),
        catchError((err) => {
          return of({ error: "failed to get data!" });
        })
      );
  }
}
