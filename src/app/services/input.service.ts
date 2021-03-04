import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Observable, of } from "rxjs";
import { timeout, catchError, tap } from "rxjs/operators";

// Base Server
const base_url = "https://ceamdev.ceeopdev.net/hms/rest/api/"

// Staging Server
//baseURL = "https://ceamstg.ceeopdev.net/hms/rest/api/";

const precipitation_url = "meteorology/precipitation/";

const temperature_url = "hydrology/temperature/";

const relative_humidity_url = "meteorology/humidity/";

const dew_point_url = "meteorology/dewpoint/";

const solar_radiation_url = "meteorology/radiation/";

const wind_url = "meteorology/wind/";

const surface_runoff_url = "hydrology/surfacerunoff/";

const subsurface_flow_url = "hydrology/subsurfaceflow/";

const soil_moisture_url = "hydrology/soilmoisture/";

const evapotranspiration_url = "hydrology/evapotranspiration/";



@Injectable({
  providedIn: 'root'
})
export class InputService {
  
  constructor(private http: HttpClient) { }
  getData(inputModule, serializedInput): Observable<any> {
    console.log(serializedInput);
    let moduleURL = precipitation_url;
    const options = {
      headers: new HttpHeaders({
        "Access-Control-Allow-Origin" : "http://localhost:5000/",
        "Access-Control-Allow-Headers" : "Content-type, Authorization",
        "Access-Control-Allow-Methods": "POST",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": "true",
        "accept" : "*/*"
        
      }),
    };

    if (inputModule == "precipitation") {
      moduleURL = precipitation_url;
    }
    if (inputModule == "temperature") {
      moduleURL = temperature_url;
    }
    if (inputModule == "relative_humidity") {
      moduleURL = relative_humidity_url;
    }
    else {
      console.log("Please select a valid module")
    }

    console.log(serializedInput);
    const postInput = { ... serializedInput };

    const requesttoSend = 
    `{​\"source\":\"nldas\",\"dateTimeSpan\":{​\"startDate\":\"2015-01-01T00:00:00\",\"endDate\":\"2015-01-08T00:00:00\",\"dateTimeFormat\":\"yyyy-MM-dd HH\"}​,\"geometry\":{​\"description\":null,\"comID\":0,\"hucID\":null,\"stationID\":null,\"point\":{​\"latitude\":33.925673,\"longitude\":-83.355723}​,\"geometryMetadata\":null,\"timezone\":null}​,\"dataValueFormat\":\"E3\",\"temporalResolution\":\"default\",\"timeLocalized\":false,\"units\":\"metric\",\"outputFormat\":\"json\",\"baseURL\":null,\"inputTimeSeries\":null}​`


    
    return this.http
      .post( "https://ceamdev.ceeopdev.net/hms/rest/api/" + "meteorology/precipitation/", requesttoSend, options)
      .pipe(
        timeout(20000),
        tap((response: any) => {
          console.log("response from HMS: " + response);
        }),
        catchError((err) => {
          return of({ error: "failed to get data!" });
        })
      );
  }
}
