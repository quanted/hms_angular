import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable, of, throwError } from "rxjs";
import { catchError, map, tap, timeout } from "rxjs/operators";

import { environment } from "../../environments/environment";

import * as animals from "../../base_jsons/base_animals.json";
import * as bioaccumulation from "../../base_jsons/base_bioaccumulation.json";
import * as chemical from "../../base_jsons/base_chemical.json";
import * as diagenesis from "../../base_jsons/base_diagenesis.json";
import * as ecotoxicology from "../../base_jsons/base_ecotoxicology.json";
import * as nutrients from "../../base_jsons/base_nutrients.json";
import * as organicmatter from "../../base_jsons/base_organicmatter.json";
import * as plants from "../../base_jsons/base_plants.json";
import * as streamhydrology from "../../base_jsons/base_streamhydrology.json";

@Injectable({
  providedIn: "root",
})
export class HmsService {
  baseJsons = {};

  constructor(private http: HttpClient) {
    this.baseJsons = {
      animals: (animals as any).default,
      bioaccumulation: (bioaccumulation as any).default,
      chemical: (chemical as any).default,
      diagenesis: (diagenesis as any).default,
      ecotoxicology: (ecotoxicology as any).default,
      nutrients: (nutrients as any).default,
      organicmatter: (organicmatter as any).default,
      plants: (plants as any).default,
      streamhydrology: (streamhydrology as any).default,
    };
  }

  getApi(): Observable<any> {
    return this.http.get(environment.swaggerURL).pipe(
      map((swagger: any) => {
        return this.buildEndpointList(swagger);
      }),
      timeout(5000),
      catchError((err) => {
        // server error so build list with cached swagger
        if (err.name == "TimeoutError") {
          return of(this.buildEndpointList(this.swagger));
        }
        return of({ error: err });
      })
    );
  }

  getATXModules() {
    return Object.keys(this.baseJsons);
  }

  getATXJsonFlags(): Observable<any> {
    return this.http.get(
      `${environment.apiURL}/api/aquatox/input-builder/base-json/flags`
    );
  }

  getBaseJsonByFlags(flags): Observable<any> {
    return this.http.post(
      `${environment.apiURL}/api/aquatox/workflow/options`,
      JSON.stringify(flags)
    );
  }

  getBaseJson(module) {
    return this.baseJsons[module];
  }

  getStreamNetwork(comid, distance): Observable<any> {
    return this.http.get(
      `${environment.apiURL}/api/info/streamnetwork?comid=${comid}&maxDistance=${distance}`
    );
  }

  buildEndpointList(swagger) {
    // console.log("swagger: ", swagger);
    const api = {
      version: "",
      apiEndpointList: [],
      schemas: [],
    };
    api.version = swagger.info.version;
    api.schemas = swagger.components.schemas;

    api.apiEndpointList = [];
    for (let apiPath of Object.keys(swagger.paths)) {
      // console.log(`${apiPath}: `, swagger.paths[apiPath]);
      // TODO this needs a lot of work to properly build a list of endpoints and parameters
      let requestType = swagger.paths[apiPath].hasOwnProperty("post")
        ? "post"
        : swagger.paths[apiPath].hasOwnProperty("get")
        ? "get"
        : "null";
      let request = swagger.paths[apiPath];
      api.apiEndpointList.push({
        endpoint: apiPath,
        urlParts: apiPath.split("/").slice(1),
        type: requestType,
        summary: request[requestType].summary,
        request:
          request[requestType]?.requestBody?.content["application/json"]
            ?.example,
      });
    }
    return api;
  }

  validateCSV(data): Observable<any> {
    return this.http.get(environment.apiURL);
  }

  submit(request): Observable<any> {
    console.log("submit: ", request);
    switch (request.type) {
      case "get":
        return this.http.get(environment.apiURL + request.endpoint);
      case "post":
        return this.http.post(
          environment.apiURL + request.endpoint + "/",
          JSON.stringify(request.args)
        );
      default:
        return of({ error: `invalid request type: ${request.endpoint}` });
    }
  }

  executeAquatoxSimulation(simulation): Observable<any> {
    console.log("execute: ", simulation);
    return this.http.post(
      `${environment.apiURL}/api/v2/hms/workflow/`,
      JSON.stringify(simulation)
    );
  }

  private swagger = {
    openapi: "3.0.1",
    info: {
      title: "HMS REST API",
      description:
        "Swagger documentation for HMS REST API with example requests and responses.",
      version: "v1",
    },
    paths: {
      "/api/info/catchment": {
        get: {
          tags: ["WSCatchment"],
          summary: "",
          parameters: [
            {
              name: "comid",
              in: "query",
              schema: { type: "string", nullable: true },
            },
            {
              name: "streamcat",
              in: "query",
              schema: { type: "boolean", default: true },
            },
            {
              name: "geometry",
              in: "query",
              schema: { type: "boolean", default: true },
            },
            {
              name: "nwis",
              in: "query",
              schema: { type: "boolean", default: true },
            },
            {
              name: "streamGeometry",
              in: "query",
              schema: { type: "boolean", default: false },
            },
            {
              name: "cn",
              in: "query",
              schema: { type: "boolean", default: false },
            },
          ],
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/contaminantloader": {
        post: {
          tags: ["WSContaminantLoader"],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ContaminantLoaderInput" },
                example: {
                  contaminantType: "generic",
                  contaminantInputType: "csv",
                  contaminantInput:
                    "Date-Time, TestValues\n2010-01-01 00, 1.0\n2010-01-01 01, 1.5\n2010-01-01 02, 2.0\n2010-01-01 03, 2.5\n2010-01-01 04, 3.0\n2010-01-01 05, 3.5\n2010-01-01 06, 4.0\n2010-01-01 07, 4.5\n2010-01-01 08, 5.0\n2010-01-01 09, 5.5\n2010-01-01 10, 6.0\n2010-01-01 11, 6.5\n2010-01-01 12, 6.0\n2010-01-01 13, 5.5\n2010-01-01 14, 5.0\n2010-01-01 15, 4.5\n2010-01-01 16, 4.0\n2010-01-01 17, 3.5\n2010-01-01 18, 3.0\n2010-01-01 19, 2.5\n2010-01-01 20, 2.0\n2010-01-01 21, 1.5\n2010-01-01 22, 1.0\n2010-01-01 23, 1.0",
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/ContaminantLoaderInput" },
                example: {
                  contaminantType: "generic",
                  contaminantInputType: "csv",
                  contaminantInput:
                    "Date-Time, TestValues\n2010-01-01 00, 1.0\n2010-01-01 01, 1.5\n2010-01-01 02, 2.0\n2010-01-01 03, 2.5\n2010-01-01 04, 3.0\n2010-01-01 05, 3.5\n2010-01-01 06, 4.0\n2010-01-01 07, 4.5\n2010-01-01 08, 5.0\n2010-01-01 09, 5.5\n2010-01-01 10, 6.0\n2010-01-01 11, 6.5\n2010-01-01 12, 6.0\n2010-01-01 13, 5.5\n2010-01-01 14, 5.0\n2010-01-01 15, 4.5\n2010-01-01 16, 4.0\n2010-01-01 17, 3.5\n2010-01-01 18, 3.0\n2010-01-01 19, 2.5\n2010-01-01 20, 2.0\n2010-01-01 21, 1.5\n2010-01-01 22, 1.0\n2010-01-01 23, 1.0",
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/ContaminantLoaderInput" },
                example: {
                  contaminantType: "generic",
                  contaminantInputType: "csv",
                  contaminantInput:
                    "Date-Time, TestValues\n2010-01-01 00, 1.0\n2010-01-01 01, 1.5\n2010-01-01 02, 2.0\n2010-01-01 03, 2.5\n2010-01-01 04, 3.0\n2010-01-01 05, 3.5\n2010-01-01 06, 4.0\n2010-01-01 07, 4.5\n2010-01-01 08, 5.0\n2010-01-01 09, 5.5\n2010-01-01 10, 6.0\n2010-01-01 11, 6.5\n2010-01-01 12, 6.0\n2010-01-01 13, 5.5\n2010-01-01 14, 5.0\n2010-01-01 15, 4.5\n2010-01-01 16, 4.0\n2010-01-01 17, 3.5\n2010-01-01 18, 3.0\n2010-01-01 19, 2.5\n2010-01-01 20, 2.0\n2010-01-01 21, 1.5\n2010-01-01 22, 1.0\n2010-01-01 23, 1.0",
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/meteorology/dewpoint": {
        post: {
          tags: ["WSDewPoint"],
          summary:
            "POST method for submitting a request for dew point temperature data.",
          requestBody: {
            description:
              "Parameters for retrieving dew point data. Required fields: DateTimeSpan.StartDate, DateTimeSpan.EndDate, Geometry.Point.Latitude, Geometry.Point.Longitude, Source",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DewPointInput" },
                example: {
                  source: "prism",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/DewPointInput" },
                example: {
                  source: "prism",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/DewPointInput" },
                example: {
                  source: "prism",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/hydrology/evapotranspiration": {
        post: {
          tags: ["WSEvapotranspiration"],
          summary:
            "POST method for submitting a request for evapotranspiration data.",
          requestBody: {
            description:
              "Parameters for retrieving evapotranspiration data. Required fields: DateTimeSpan.StartDate, DateTimeSpan.EndDate, Geometry.Point.Latitude, Geometry.Point.Longitude, Source",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EvapotranspirationInput",
                },
                example: {
                  algorithm: "nldas",
                  albedo: 0.23,
                  centralLongitude: 75.0,
                  sunAngle: 17.2,
                  emissivity: 0.92,
                  model: "ETP",
                  zenith: 0.05,
                  lakeSurfaceArea: 0.005,
                  lakeDepth: 0.2,
                  subsurfaceResistance: 500.0,
                  stomatalResistance: 400.0,
                  leafWidth: 0.02,
                  roughnessLength: 0.02,
                  vegetationHeight: 0.12,
                  leafAreaIndices: {
                    "12": 2.51,
                    "11": 2.51,
                    "10": 2.51,
                    "9": 2.51,
                    "8": 2.51,
                    "7": 2.51,
                    "6": 2.51,
                    "5": 2.51,
                    "4": 2.51,
                    "3": 2.51,
                    "2": 2.51,
                    "1": 2.51,
                  },
                  airTemperature: {
                    "12": 1.0,
                    "11": 1.0,
                    "10": 1.0,
                    "9": 1.0,
                    "8": 1.0,
                    "7": 1.0,
                    "6": 1.0,
                    "5": 1.0,
                    "4": 1.0,
                    "3": 1.0,
                    "2": 1.0,
                    "1": 1.0,
                  },
                  userData:
                    "2015-01-01 00Z -2.7000E-03\n2015 - 01 - 01 01Z - 1.9000E-03\n2015 - 01 - 01 02Z - 1.3000E-03\n2015 - 01 - 01 03Z - 9.0000E-04\n2015 - 01 - 01 04Z - 3.0000E-04",
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: true,
                  units: "default",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: {
                  $ref: "#/components/schemas/EvapotranspirationInput",
                },
                example: {
                  algorithm: "nldas",
                  albedo: 0.23,
                  centralLongitude: 75.0,
                  sunAngle: 17.2,
                  emissivity: 0.92,
                  model: "ETP",
                  zenith: 0.05,
                  lakeSurfaceArea: 0.005,
                  lakeDepth: 0.2,
                  subsurfaceResistance: 500.0,
                  stomatalResistance: 400.0,
                  leafWidth: 0.02,
                  roughnessLength: 0.02,
                  vegetationHeight: 0.12,
                  leafAreaIndices: {
                    "12": 2.51,
                    "11": 2.51,
                    "10": 2.51,
                    "9": 2.51,
                    "8": 2.51,
                    "7": 2.51,
                    "6": 2.51,
                    "5": 2.51,
                    "4": 2.51,
                    "3": 2.51,
                    "2": 2.51,
                    "1": 2.51,
                  },
                  airTemperature: {
                    "12": 1.0,
                    "11": 1.0,
                    "10": 1.0,
                    "9": 1.0,
                    "8": 1.0,
                    "7": 1.0,
                    "6": 1.0,
                    "5": 1.0,
                    "4": 1.0,
                    "3": 1.0,
                    "2": 1.0,
                    "1": 1.0,
                  },
                  userData:
                    "2015-01-01 00Z -2.7000E-03\n2015 - 01 - 01 01Z - 1.9000E-03\n2015 - 01 - 01 02Z - 1.3000E-03\n2015 - 01 - 01 03Z - 9.0000E-04\n2015 - 01 - 01 04Z - 3.0000E-04",
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: true,
                  units: "default",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: {
                  $ref: "#/components/schemas/EvapotranspirationInput",
                },
                example: {
                  algorithm: "nldas",
                  albedo: 0.23,
                  centralLongitude: 75.0,
                  sunAngle: 17.2,
                  emissivity: 0.92,
                  model: "ETP",
                  zenith: 0.05,
                  lakeSurfaceArea: 0.005,
                  lakeDepth: 0.2,
                  subsurfaceResistance: 500.0,
                  stomatalResistance: 400.0,
                  leafWidth: 0.02,
                  roughnessLength: 0.02,
                  vegetationHeight: 0.12,
                  leafAreaIndices: {
                    "12": 2.51,
                    "11": 2.51,
                    "10": 2.51,
                    "9": 2.51,
                    "8": 2.51,
                    "7": 2.51,
                    "6": 2.51,
                    "5": 2.51,
                    "4": 2.51,
                    "3": 2.51,
                    "2": 2.51,
                    "1": 2.51,
                  },
                  airTemperature: {
                    "12": 1.0,
                    "11": 1.0,
                    "10": 1.0,
                    "9": 1.0,
                    "8": 1.0,
                    "7": 1.0,
                    "6": 1.0,
                    "5": 1.0,
                    "4": 1.0,
                    "3": 1.0,
                    "2": 1.0,
                    "1": 1.0,
                  },
                  userData:
                    "2015-01-01 00Z -2.7000E-03\n2015 - 01 - 01 01Z - 1.9000E-03\n2015 - 01 - 01 02Z - 1.3000E-03\n2015 - 01 - 01 03Z - 9.0000E-04\n2015 - 01 - 01 04Z - 3.0000E-04",
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: true,
                  units: "default",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/meteorology/humidity": {
        post: {
          tags: ["WSHumidity"],
          summary: "POST method for submitting a request for humidity data.",
          requestBody: {
            description:
              "Parameters for retrieving humidity data. Required fields: DateTimeSpan.StartDate, DateTimeSpan.EndDate, Geometry.Point.Latitude, Geometry.Point.Longitude, Source",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HumidityInput" },
                example: {
                  relative: true,
                  source: "prism",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/HumidityInput" },
                example: {
                  relative: true,
                  source: "prism",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/HumidityInput" },
                example: {
                  relative: true,
                  source: "prism",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/meteorology/solar": {
        post: {
          tags: ["WSMeteorologySolar"],
          summary: "NOAA Solar Calculator",
          requestBody: {
            description: "",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SolarCalculatorInput" },
                example: {
                  model: "year",
                  localTime: "12:00:00",
                  source: null,
                  dateTimeSpan: {
                    startDate: "2010-01-01T00:00:00",
                    endDate: "2010-12-31T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 40.0, longitude: -105.0 },
                    geometryMetadata: null,
                    timezone: { name: null, offset: -7.0, dls: false },
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/SolarCalculatorInput" },
                example: {
                  model: "year",
                  localTime: "12:00:00",
                  source: null,
                  dateTimeSpan: {
                    startDate: "2010-01-01T00:00:00",
                    endDate: "2010-12-31T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 40.0, longitude: -105.0 },
                    geometryMetadata: null,
                    timezone: { name: null, offset: -7.0, dls: false },
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/SolarCalculatorInput" },
                example: {
                  model: "year",
                  localTime: "12:00:00",
                  source: null,
                  dateTimeSpan: {
                    startDate: "2010-01-01T00:00:00",
                    endDate: "2010-12-31T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 40.0, longitude: -105.0 },
                    geometryMetadata: null,
                    timezone: { name: null, offset: -7.0, dls: false },
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/meteorology/precipitation": {
        post: {
          tags: ["WSPrecipitation"],
          summary:
            "POST method for submitting a request for precipitation data.",
          requestBody: {
            description:
              "Parameters for retrieving precipitation data. Required fields: DateTimeSpan.StartDate, DateTimeSpan.EndDate, Geometry.Point.Latitude, Geometry.Point.Longitude, Source",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PrecipitationInput" },
                example: {
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: false,
                  units: "metric",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/PrecipitationInput" },
                example: {
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: false,
                  units: "metric",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/PrecipitationInput" },
                example: {
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: false,
                  units: "metric",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/meteorology/pressure": {
        post: {
          tags: ["WSPressure"],
          summary: "POST method for submitting a request for pressure data.",
          requestBody: {
            description:
              "Parameters for retrieving pressure data. Required fields: DateTimeSpan.StartDate, DateTimeSpan.EndDate, Geometry.Point.Latitude, Geometry.Point.Longitude, Source",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PressureInput" },
                example: {
                  source: "gldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/PressureInput" },
                example: {
                  source: "gldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/PressureInput" },
                example: {
                  source: "gldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/meteorology/radiation": {
        post: {
          tags: ["WSRadiation"],
          summary: "POST method for submitting a request for radiation data.",
          requestBody: {
            description:
              "Parameters for retrieving radiation data. Required fields: DateTimeSpan.StartDate, DateTimeSpan.EndDate, Geometry.Point.Latitude, Geometry.Point.Longitude, Source",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RadiationInput" },
                example: {
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/RadiationInput" },
                example: {
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/RadiationInput" },
                example: {
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/hydrology/soilmoisture": {
        post: {
          tags: ["WSSoilMoisture"],
          summary:
            "POST method for submitting a request for soil moisture data.",
          requestBody: {
            description:
              "Parameters for retrieving SoilMoisture data. Required fields: DateTimeSpan.StartDate, DateTimeSpan.EndDate, Geometry.Point.Latitude, Geometry.Point.Longitude, Source",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SoilMoistureInput" },
                example: {
                  layers: ["0-10", "10-40"],
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/SoilMoistureInput" },
                example: {
                  layers: ["0-10", "10-40"],
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/SoilMoistureInput" },
                example: {
                  layers: ["0-10", "10-40"],
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/water-quality/solar/run": {
        get: {
          tags: ["WSSolar"],
          summary:
            "GET request for retrieving the default output values for the GCSolar module, \r\nthis is equivalent to selecting the third option from the start menu of the desktop application.",
          responses: { "200": { description: "Success" } },
        },
        post: {
          tags: ["WSSolar"],
          summary:
            "POST request for retrieving solar data using custom values from the GCSolar module,\r\nthis is equivalent to selecting the second option from the start menu of the desktop application.",
          requestBody: {
            description: "",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SolarInput" },
                example: {
                  input: {
                    "contaminant name": "Methoxyclor",
                    "contaminant type": "Chemical",
                    "water type name": "Pure Water",
                    "min wavelength": 297.5,
                    "max wavelength": 330,
                    longitude: "83.2",
                    "latitude(s)": [
                      40, -99, -99, -99, -99, -99, -99, -99, -99, -99,
                    ],
                    "season(s)": ["Spring", " ", " ", " "],
                    "atmospheric ozone layer": 0.3,
                    "initial depth (cm)": "0.001",
                    "final depth (cm)": "5",
                    "depth increment (cm)": "10",
                    "quantum yield": "0.32",
                    "refractive index": "1.34",
                    elevation: "0",
                    "wavelength table": {
                      "297.50": {
                        "water attenuation coefficients (m**-1)": "0.069000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "11.100000",
                      },
                      "300.00": {
                        "water attenuation coefficients (m**-1)": "0.061000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "4.6700000",
                      },
                      "302.50": {
                        "water attenuation coefficients (m**-1)": "0.057000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "1.900000",
                      },
                      "305.00": {
                        "water attenuation coefficients (m**-1)": "0.053000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "1.100000",
                      },
                      "307.50": {
                        "water attenuation coefficients (m**-1)": "0.049000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.800000",
                      },
                      "310.00": {
                        "water attenuation coefficients (m**-1)": "0.045000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.5300000",
                      },
                      "312.50": {
                        "water attenuation coefficients (m**-1)": "0.043000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.330000",
                      },
                      "315.00": {
                        "water attenuation coefficients (m**-1)": "0.041000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.270000",
                      },
                      "317.50": {
                        "water attenuation coefficients (m**-1)": "0.039000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.1600000",
                      },
                      "320.00": {
                        "water attenuation coefficients (m**-1)": "0.037000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.100000",
                      },
                      "323.10": {
                        "water attenuation coefficients (m**-1)": "0.035000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.060000",
                      },
                      "330.00": {
                        "water attenuation coefficients (m**-1)": "0.029000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.020000",
                      },
                    },
                  },
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/SolarInput" },
                example: {
                  input: {
                    "contaminant name": "Methoxyclor",
                    "contaminant type": "Chemical",
                    "water type name": "Pure Water",
                    "min wavelength": 297.5,
                    "max wavelength": 330,
                    longitude: "83.2",
                    "latitude(s)": [
                      40, -99, -99, -99, -99, -99, -99, -99, -99, -99,
                    ],
                    "season(s)": ["Spring", " ", " ", " "],
                    "atmospheric ozone layer": 0.3,
                    "initial depth (cm)": "0.001",
                    "final depth (cm)": "5",
                    "depth increment (cm)": "10",
                    "quantum yield": "0.32",
                    "refractive index": "1.34",
                    elevation: "0",
                    "wavelength table": {
                      "297.50": {
                        "water attenuation coefficients (m**-1)": "0.069000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "11.100000",
                      },
                      "300.00": {
                        "water attenuation coefficients (m**-1)": "0.061000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "4.6700000",
                      },
                      "302.50": {
                        "water attenuation coefficients (m**-1)": "0.057000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "1.900000",
                      },
                      "305.00": {
                        "water attenuation coefficients (m**-1)": "0.053000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "1.100000",
                      },
                      "307.50": {
                        "water attenuation coefficients (m**-1)": "0.049000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.800000",
                      },
                      "310.00": {
                        "water attenuation coefficients (m**-1)": "0.045000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.5300000",
                      },
                      "312.50": {
                        "water attenuation coefficients (m**-1)": "0.043000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.330000",
                      },
                      "315.00": {
                        "water attenuation coefficients (m**-1)": "0.041000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.270000",
                      },
                      "317.50": {
                        "water attenuation coefficients (m**-1)": "0.039000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.1600000",
                      },
                      "320.00": {
                        "water attenuation coefficients (m**-1)": "0.037000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.100000",
                      },
                      "323.10": {
                        "water attenuation coefficients (m**-1)": "0.035000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.060000",
                      },
                      "330.00": {
                        "water attenuation coefficients (m**-1)": "0.029000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.020000",
                      },
                    },
                  },
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/SolarInput" },
                example: {
                  input: {
                    "contaminant name": "Methoxyclor",
                    "contaminant type": "Chemical",
                    "water type name": "Pure Water",
                    "min wavelength": 297.5,
                    "max wavelength": 330,
                    longitude: "83.2",
                    "latitude(s)": [
                      40, -99, -99, -99, -99, -99, -99, -99, -99, -99,
                    ],
                    "season(s)": ["Spring", " ", " ", " "],
                    "atmospheric ozone layer": 0.3,
                    "initial depth (cm)": "0.001",
                    "final depth (cm)": "5",
                    "depth increment (cm)": "10",
                    "quantum yield": "0.32",
                    "refractive index": "1.34",
                    elevation: "0",
                    "wavelength table": {
                      "297.50": {
                        "water attenuation coefficients (m**-1)": "0.069000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "11.100000",
                      },
                      "300.00": {
                        "water attenuation coefficients (m**-1)": "0.061000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "4.6700000",
                      },
                      "302.50": {
                        "water attenuation coefficients (m**-1)": "0.057000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "1.900000",
                      },
                      "305.00": {
                        "water attenuation coefficients (m**-1)": "0.053000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "1.100000",
                      },
                      "307.50": {
                        "water attenuation coefficients (m**-1)": "0.049000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.800000",
                      },
                      "310.00": {
                        "water attenuation coefficients (m**-1)": "0.045000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.5300000",
                      },
                      "312.50": {
                        "water attenuation coefficients (m**-1)": "0.043000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.330000",
                      },
                      "315.00": {
                        "water attenuation coefficients (m**-1)": "0.041000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.270000",
                      },
                      "317.50": {
                        "water attenuation coefficients (m**-1)": "0.039000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.1600000",
                      },
                      "320.00": {
                        "water attenuation coefficients (m**-1)": "0.037000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.100000",
                      },
                      "323.10": {
                        "water attenuation coefficients (m**-1)": "0.035000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.060000",
                      },
                      "330.00": {
                        "water attenuation coefficients (m**-1)": "0.029000",
                        "chemical absorption coefficients (L/(mole cm))":
                          "0.020000",
                      },
                    },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/water-quality/solar/inputs": {
        get: {
          tags: ["WSSolar"],
          summary:
            "GET request for retrieving the default input values for the GCSolar module,\r\nthis is equivalent to selecting the first option from the start menu of the desktop application.",
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/water-quality/solar/inputs/metadata": {
        get: {
          tags: ["WSSolar"],
          summary:
            "GET request for metadata on the inputs for the GCSolar module.",
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/hydrology/streamflow": {
        post: {
          tags: ["WSStreamflow"],
          summary:
            "POST method for submitting a request for precipitation data.",
          requestBody: {
            description:
              "Parameters for retrieving streamflow data. Required fields: DateTimeSpan.StartDate, DateTimeSpan.EndDate, Geometry.GeometryMetadata.gaugestation, Source",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StreamflowInput" },
                example: {
                  source: "nwis",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-12-31T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: null,
                    geometryMetadata: { gaugestation: "02191300" },
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "hourly",
                  timeLocalized: false,
                  units: "metric",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/StreamflowInput" },
                example: {
                  source: "nwis",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-12-31T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: null,
                    geometryMetadata: { gaugestation: "02191300" },
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "hourly",
                  timeLocalized: false,
                  units: "metric",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/StreamflowInput" },
                example: {
                  source: "nwis",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-12-31T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: null,
                    geometryMetadata: { gaugestation: "02191300" },
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "hourly",
                  timeLocalized: false,
                  units: "metric",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/hydrology/subsurfaceflow": {
        post: {
          tags: ["WSSubSurfaceFlow"],
          summary:
            "POST method for submitting a request for subsurface flow data.",
          requestBody: {
            description:
              "Parameters for retrieving SubSurfaceFlow data. Required fields: DateTimeSpan.StartDate, DateTimeSpan.EndDate, Geometry.Point.Latitude, Geometry.Point.Longitude, Source",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SubSurfaceFlowInput" },
                example: {
                  precipSource: null,
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/SubSurfaceFlowInput" },
                example: {
                  precipSource: null,
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/SubSurfaceFlowInput" },
                example: {
                  precipSource: null,
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/hydrology/surfacerunoff": {
        post: {
          tags: ["WSSurfaceRunoff"],
          summary:
            "POST method for submitting a request for surface runoff data.",
          requestBody: {
            description:
              "Parameters for retrieving SurfaceRunoff data. Required fields: DateTimeSpan.StartDate, DateTimeSpan.EndDate, Geometry.Point.Latitude, Geometry.Point.Longitude, Source",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SurfaceRunoffInput" },
                example: {
                  precipSource: null,
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/SurfaceRunoffInput" },
                example: {
                  precipSource: null,
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/SurfaceRunoffInput" },
                example: {
                  precipSource: null,
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/hydrology/temperature": {
        post: {
          tags: ["WSTemperature"],
          summary:
            "POST method for submitting a request for evapotranspiration data.",
          requestBody: {
            description:
              "Parameters for retrieving evapotranspiration data. Required fields: DateTimeSpan.StartDate, DateTimeSpan.EndDate, Geometry.Point.Latitude, Geometry.Point.Longitude, Source",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TemperatureInput" },
                example: {
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/TemperatureInput" },
                example: {
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/TemperatureInput" },
                example: {
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/hydrology/totalflow": {
        post: {
          tags: ["WSTotalFlow"],
          summary: "POST method for submitting a request for total flow data.",
          requestBody: {
            description: "",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TotalFlowInput" },
                example: {
                  geometryType: "comid",
                  geometryInput: "1049831",
                  geometryInputs: null,
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-12-31T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: null,
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/TotalFlowInput" },
                example: {
                  geometryType: "comid",
                  geometryInput: "1049831",
                  geometryInputs: null,
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-12-31T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: null,
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/TotalFlowInput" },
                example: {
                  geometryType: "comid",
                  geometryInput: "1049831",
                  geometryInputs: null,
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-12-31T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: null,
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/utilities/status": {
        get: {
          tags: ["WSUtilities"],
          summary: "Checks endpoints for all datasets.",
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/workflow/timeoftravel": {
        post: {
          tags: ["WSWatershedDelineation"],
          summary:
            "POST method for submitting a request for delineation compare data.\r\nSource parameter must contain a value, but value is not used.",
          requestBody: {
            description:
              "Parameters for retrieving DelineationCompare data. Required fields: Dataset, SourceList",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/WatershedDelineationInput",
                },
                example: {
                  contaminantInflow: null,
                  inflowSource: null,
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: "EPA Athens Office",
                    comID: 0,
                    hucID: "030502040102",
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: {
                      City: "Athens",
                      State: "Georgia",
                      Country: "United States",
                      huc_12_num: "030502040102",
                    },
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: true,
                  units: "default",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: {
                  $ref: "#/components/schemas/WatershedDelineationInput",
                },
                example: {
                  contaminantInflow: null,
                  inflowSource: null,
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: "EPA Athens Office",
                    comID: 0,
                    hucID: "030502040102",
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: {
                      City: "Athens",
                      State: "Georgia",
                      Country: "United States",
                      huc_12_num: "030502040102",
                    },
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: true,
                  units: "default",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: {
                  $ref: "#/components/schemas/WatershedDelineationInput",
                },
                example: {
                  contaminantInflow: null,
                  inflowSource: null,
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: "EPA Athens Office",
                    comID: 0,
                    hucID: "030502040102",
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: {
                      City: "Athens",
                      State: "Georgia",
                      Country: "United States",
                      huc_12_num: "030502040102",
                    },
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: true,
                  units: "default",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/workflow/watershed": {
        post: {
          tags: ["WSWatershedWorkflow"],
          summary:
            "POST method for submitting a request for getting workflow compare data.\r\nSource parameter must contain a value, but value is not used.",
          requestBody: {
            description:
              "Parameters for retrieving WorkFlowCompare data. Required fields: Dataset, SourceList",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WatershedWorkflowInput" },
                example: {
                  runoffSource: "curvenumber",
                  streamHydrology: "constant",
                  aggregation: false,
                  source: "streamflow",
                  dateTimeSpan: {
                    startDate: "2014-07-01T00:00:00",
                    endDate: "2014-07-31T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: "030502040102",
                    stationID: null,
                    point: null,
                    geometryMetadata: { precipSource: "daymet" },
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: true,
                  units: "default",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/WatershedWorkflowInput" },
                example: {
                  runoffSource: "curvenumber",
                  streamHydrology: "constant",
                  aggregation: false,
                  source: "streamflow",
                  dateTimeSpan: {
                    startDate: "2014-07-01T00:00:00",
                    endDate: "2014-07-31T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: "030502040102",
                    stationID: null,
                    point: null,
                    geometryMetadata: { precipSource: "daymet" },
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: true,
                  units: "default",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/WatershedWorkflowInput" },
                example: {
                  runoffSource: "curvenumber",
                  streamHydrology: "constant",
                  aggregation: false,
                  source: "streamflow",
                  dateTimeSpan: {
                    startDate: "2014-07-01T00:00:00",
                    endDate: "2014-07-31T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: "030502040102",
                    stationID: null,
                    point: null,
                    geometryMetadata: { precipSource: "daymet" },
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: true,
                  units: "default",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/meteorology/wind": {
        post: {
          tags: ["WSWind"],
          summary: "POST method for submitting a request for wind data.",
          requestBody: {
            description:
              "Parameters for retrieving wind data. Required fields: DateTimeSpan.StartDate, DateTimeSpan.EndDate, Geometry.Point.Latitude, Geometry.Point.Longitude, Source",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WindInput" },
                example: {
                  component: "all",
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/WindInput" },
                example: {
                  component: "all",
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/WindInput" },
                example: {
                  component: "all",
                  source: "nldas",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: null,
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: null,
                    point: { latitude: 33.925673, longitude: -83.355723 },
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: null,
                  temporalResolution: null,
                  timeLocalized: false,
                  units: null,
                  outputFormat: null,
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/workflow/precip_compare": {
        post: {
          tags: ["WSWorkflowPrecip"],
          summary:
            "POST method for submitting a request for precip comparison data.\r\nSource parameter must contain a value, but value is not used.",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PrecipitationCompareInput",
                },
                example: {
                  dataset: "Precipitation",
                  sourceList: ["nldas", "gldas"],
                  weighted: true,
                  extremeDaily: 0.0,
                  extremeTotal: 0.0,
                  source: "compare",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 1053791,
                    hucID: null,
                    stationID: null,
                    point: null,
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: false,
                  units: "metric",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: {
                  $ref: "#/components/schemas/PrecipitationCompareInput",
                },
                example: {
                  dataset: "Precipitation",
                  sourceList: ["nldas", "gldas"],
                  weighted: true,
                  extremeDaily: 0.0,
                  extremeTotal: 0.0,
                  source: "compare",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 1053791,
                    hucID: null,
                    stationID: null,
                    point: null,
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: false,
                  units: "metric",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: {
                  $ref: "#/components/schemas/PrecipitationCompareInput",
                },
                example: {
                  dataset: "Precipitation",
                  sourceList: ["nldas", "gldas"],
                  weighted: true,
                  extremeDaily: 0.0,
                  extremeTotal: 0.0,
                  source: "compare",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 1053791,
                    hucID: null,
                    stationID: null,
                    point: null,
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: false,
                  units: "metric",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/workflow/precip_data_extraction": {
        post: {
          tags: ["WSWorkflowPrecip"],
          summary:
            "POST method for submitting a request for precip extraction data.\r\nSource parameter must contain a value, but value is not used.",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PrecipitationExtractionInput",
                },
                example: {
                  dataset: "Precipitation",
                  sourceList: ["ncei", "nldas"],
                  source: "extraction",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: "GHCND:USW00013874",
                    point: null,
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: false,
                  units: "metric",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "text/json": {
                schema: {
                  $ref: "#/components/schemas/PrecipitationExtractionInput",
                },
                example: {
                  dataset: "Precipitation",
                  sourceList: ["ncei", "nldas"],
                  source: "extraction",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: "GHCND:USW00013874",
                    point: null,
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: false,
                  units: "metric",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
              "application/*+json": {
                schema: {
                  $ref: "#/components/schemas/PrecipitationExtractionInput",
                },
                example: {
                  dataset: "Precipitation",
                  sourceList: ["ncei", "nldas"],
                  source: "extraction",
                  dateTimeSpan: {
                    startDate: "2015-01-01T00:00:00",
                    endDate: "2015-01-08T00:00:00",
                    dateTimeFormat: "yyyy-MM-dd HH",
                  },
                  geometry: {
                    description: null,
                    comID: 0,
                    hucID: null,
                    stationID: "GHCND:USW00013874",
                    point: null,
                    geometryMetadata: null,
                    timezone: null,
                  },
                  dataValueFormat: "E3",
                  temporalResolution: "default",
                  timeLocalized: false,
                  units: "metric",
                  outputFormat: "json",
                  baseURL: null,
                  inputTimeSeries: null,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
      "/api/workflow/waterquality": {
        post: {
          tags: ["WSWorkflowWaterQuality"],
          summary:
            "POST method to submit a request for water quality data.\r\ndataSource can be 'nldas' or 'ncei', which will pull data from GHCND:US1NCCM0006",
          requestBody: {
            description: "",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WaterQualityInput" },
                example: {
                  taskID: null,
                  dataSource: "nldas",
                  minNitrate: 1000,
                  maxNitrate: 10000,
                  minAmmonia: 100000,
                  maxAmmonia: 750000,
                },
              },
              "text/json": {
                schema: { $ref: "#/components/schemas/WaterQualityInput" },
                example: {
                  taskID: null,
                  dataSource: "nldas",
                  minNitrate: 1000,
                  maxNitrate: 10000,
                  minAmmonia: 100000,
                  maxAmmonia: 750000,
                },
              },
              "application/*+json": {
                schema: { $ref: "#/components/schemas/WaterQualityInput" },
                example: {
                  taskID: null,
                  dataSource: "nldas",
                  minNitrate: 1000,
                  maxNitrate: 10000,
                  minAmmonia: 100000,
                  maxAmmonia: 750000,
                },
              },
            },
          },
          responses: { "200": { description: "Success" } },
        },
      },
    },
    components: {
      schemas: {
        ContaminantLoaderInput: {
          type: "object",
          properties: {
            contaminantType: { type: "string", nullable: true },
            contaminantInputType: { type: "string", nullable: true },
            contaminantInput: { type: "string", nullable: true },
          },
          description:
            "ContaminantLoader Input that implements TimeSeriesInput object",
        },
        DateTimeSpan: {
          type: "object",
          properties: {
            startDate: {
              type: "string",
              description: "Start date of the time series.",
              format: "date-time",
            },
            endDate: {
              type: "string",
              description: "End date of the time series.",
              format: "date-time",
            },
            dateTimeFormat: {
              type: "string",
              description:
                "Format for the output of DateTime values.\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/8kb3ddd4(v=vs.110).aspx\r\nDefault Value: E3",
              nullable: true,
            },
          },
          description:
            "DateTimeSpan object for specifying the temporal timespan of the returned timeseries data.",
        },
        PointCoordinate: {
          type: "object",
          properties: {
            latitude: {
              type: "number",
              description: "Latitude value of point geometry.",
              format: "double",
            },
            longitude: {
              type: "number",
              description: "Longitude value of point geometry.",
              format: "double",
            },
          },
          description:
            "Point geometry object for specifying a point geospatial area of interest.",
        },
        Timezone: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Timezone name.",
              nullable: true,
            },
            offset: {
              type: "number",
              description: "Timezone offset from GMT.",
              format: "double",
            },
            dls: {
              type: "boolean",
              description:
                "Indicates if day light savings is active or not.\r\nCurrently not being utilized.",
            },
          },
          description:
            "Timezone information corresponding to the geospatial area of interest, specified within the Geometry object.",
        },
        TimeSeriesGeometry: {
          type: "object",
          properties: {
            description: {
              type: "string",
              description:
                "Description of the geometry, used to indicate details about the type of location the point represents.",
              nullable: true,
            },
            comID: {
              type: "integer",
              description: "NHDPlus v2 catchment identifier.",
              format: "int32",
            },
            hucID: {
              type: "string",
              description:
                "NHDPlus v2 Hydrologic Unit Code idendifier, specifically a HUC8 or HUC12 ID.",
              nullable: true,
            },
            stationID: {
              type: "string",
              description:
                "NCEI weather station ID, supports GHCND and COOP stations. If station type is not prepended to the ID, assumed to be GHCND.",
              nullable: true,
            },
            point: { $ref: "#/components/schemas/PointCoordinate" },
            geometryMetadata: {
              type: "object",
              additionalProperties: { type: "string" },
              description:
                "Dictionary for holding metadata and additional information about the provided geometry.",
              nullable: true,
            },
            timezone: { $ref: "#/components/schemas/Timezone" },
          },
          description:
            "The geospatial area of interest object for the returned time series data.",
        },
        TimeSeriesOutput: {
          type: "object",
          properties: {
            dataset: {
              type: "string",
              description: "Dataset for the time series.",
              nullable: true,
            },
            dataSource: {
              type: "string",
              description: "Source of the dataset.",
              nullable: true,
            },
            metadata: {
              type: "object",
              additionalProperties: { type: "string" },
              description:
                "Metadata dictionary providing details for the time series.",
              nullable: true,
            },
            data: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: { type: "string" },
              },
              description: "Time series data.",
              nullable: true,
            },
          },
          description: "Concrete TimeSeriesOutput class",
        },
        DewPointInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description: "Dew Point Input that implements TimeSeriesInput object",
        },
        EvapotranspirationInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            algorithm: {
              type: "string",
              description: "REQUIRED: Algorithm used for Evapotranspiration.",
              nullable: true,
            },
            albedo: {
              type: "number",
              description: "REQUIRED: Albedo coefficient.",
              format: "double",
            },
            centralLongitude: {
              type: "number",
              description:
                "REQUIRED: Central Longitude of Time Zone in degrees.",
              format: "double",
            },
            sunAngle: {
              type: "number",
              description: "REQUIRED: Angle of the sun in degrees.",
              format: "double",
            },
            emissivity: {
              type: "number",
              description:
                "REQUIRED: The ability of a surface to emit radiant energy.",
              format: "double",
            },
            model: {
              type: "string",
              description:
                "REQUIRED: Specifies if potential, actual, or wet environment evaporation are used.",
              nullable: true,
            },
            zenith: {
              type: "number",
              description: "REQUIRED: Zenith Albedo coefficient.",
              format: "double",
            },
            lakeSurfaceArea: {
              type: "number",
              description:
                "REQUIRED: Surface area of lake in square kilometers.",
              format: "double",
            },
            lakeDepth: {
              type: "number",
              description: "REQUIRED: Average depth of lake in meters.",
              format: "double",
            },
            subsurfaceResistance: {
              type: "number",
              description: "REQUIRED: Subsurface Resistance.",
              format: "double",
            },
            stomatalResistance: {
              type: "number",
              description: "REQUIRED: Stomatal Resistance.",
              format: "double",
            },
            leafWidth: {
              type: "number",
              description: "REQUIRED: Leaf Width in meters.",
              format: "double",
            },
            roughnessLength: {
              type: "number",
              description: "REQUIRED: Roughness Length in meters.",
              format: "double",
            },
            vegetationHeight: {
              type: "number",
              description: "REQUIRED: Vegetation Height in meters.",
              format: "double",
            },
            leafAreaIndices: {
              type: "object",
              additionalProperties: { type: "object" },
              description: "REQUIRED: Monthly leaf area indices.",
              nullable: true,
            },
            airTemperature: {
              type: "object",
              additionalProperties: { type: "object" },
              description: "REQUIRED: Monthly air temperature coefficients.",
              nullable: true,
            },
            userData: {
              type: "string",
              description: "OPTIONAL: Data file provided by the user.",
              nullable: true,
            },
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description:
            "Evapotranspiration Input that implements TimeSeriesInput object",
        },
        HumidityInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            relative: {
              type: "boolean",
              description: "Relative or Specific Humidity",
            },
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description: "Humidity Input that implements TimeSeriesInput object",
        },
        SolarCalculatorInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            model: {
              type: "string",
              description: "Calculator model: 'Day' or 'Year'",
              nullable: true,
            },
            localTime: {
              type: "string",
              description:
                "Calculation localtime for when model='year', default='12:00:00'",
              nullable: true,
            },
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description: "Solar Calculator Input object",
        },
        PrecipitationInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description:
            "Precipitation Input that implements TimeSeriesInput object.",
        },
        PressureInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description: "Pressure Input that implements TimeSeriesInput object",
        },
        RadiationInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description: "Radiation Input that implements TimeSeriesInput object",
        },
        SoilMoistureInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            layers: {
              type: "array",
              items: { type: "string" },
              description: "List of requested soil moisture layers",
              nullable: true,
            },
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description:
            "SoilMoisture Input that implements TimeSeriesInput object",
        },
        SolarInput: {
          type: "object",
          properties: {
            input: {
              type: "object",
              additionalProperties: { type: "object" },
              description: "Input Dictionary, containing unknown values.",
              nullable: true,
            },
          },
          description: "Solar Data input object",
        },
        StreamflowInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description:
            "Streamflow Input that implements TimeSeriesInput object.",
        },
        SubSurfaceFlowInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            precipSource: {
              type: "string",
              description:
                "OPTIONAL: Precipitation data source for Curve Number (NLDAS, GLDAS, NCDC, DAYMET, PRISM, WGEN)",
              nullable: true,
            },
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description:
            "SubSurfaceFlow Input that implements TimeSeriesInput object",
        },
        SurfaceRunoffInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            precipSource: {
              type: "string",
              description:
                "OPTIONAL: Precipitation data source for Curve Number (NLDAS, GLDAS, NCDC, DAYMET, PRISM, WGEN)",
              nullable: true,
            },
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description:
            "SurfaceRunoff Input that implements TimeSeriesInput object",
        },
        TemperatureInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description:
            "Temperature Input that implements TimeSeriesInput object",
        },
        TotalFlowInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            geometryType: {
              type: "string",
              description:
                'Specifies the type of geometry provided\r\nValid values: "huc", "commid", "catchmentid", "catchment", "flowline", "points"',
              nullable: true,
            },
            geometryInput: {
              type: "string",
              description:
                "Contains the geometry data, type specified by geometry Type. \r\nValid formats are: an ID for type huc, commid, and catchmentid; geojson for types catchment and flowline; and points for type points",
              nullable: true,
            },
            geometryInputs: {
              type: "object",
              additionalProperties: { type: "string" },
              description:
                "Contains the type as key and input as value, used when multiple inputs are needed for a request",
              nullable: true,
            },
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description:
            "Input class for Total Flow (subsurface flow and surface flow)",
        },
        WatershedDelineationInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            contaminantInflow: {
              type: "array",
              items: { type: "array", items: { type: "object" } },
              nullable: true,
            },
            inflowSource: { type: "string", nullable: true },
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description:
            "Delineation Input that implements TimeSeriesInput object.",
        },
        WatershedWorkflowInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            runoffSource: {
              type: "string",
              description:
                "OPTIONAL: Specifies the requested source for Runoff Data",
              nullable: true,
            },
            streamHydrology: {
              type: "string",
              description:
                "OPTIONAL: Specifies the requested Stream Hydrology Algorithm to use",
              nullable: true,
            },
            aggregation: {
              type: "boolean",
              description:
                "OPTIONAL: States whether or not runoff should be aggregated by catchments",
            },
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description: "WorkFlow Input that implements TimeSeriesInput object.",
        },
        WindInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description: "Wind Input that implements TimeSeriesInput object",
        },
        PrecipitationCompareInput: {
          required: [
            "dataset",
            "dateTimeSpan",
            "geometry",
            "source",
            "sourceList",
            "weighted",
          ],
          type: "object",
          properties: {
            dataset: {
              type: "string",
              description: "Specified dataset for the workflow",
            },
            sourceList: {
              type: "array",
              items: { type: "string" },
              description: "List of sources for the workflow.",
            },
            weighted: {
              type: "boolean",
              description:
                "States whether or not precip should be aggregated by grid cells (weighted spatial average).",
            },
            extremeDaily: {
              type: "number",
              description: "Daily precip threshold in mm.",
              format: "double",
            },
            extremeTotal: {
              type: "number",
              description: "Five day total precip threshold in mm.",
              format: "double",
            },
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description:
            "PrecipitationCompare Input that implements TimeSeriesInput object.",
        },
        PrecipitationExtractionInput: {
          required: ["dateTimeSpan", "geometry", "source"],
          type: "object",
          properties: {
            dataset: {
              type: "string",
              description: "Specified dataset for the workflow",
              nullable: true,
            },
            sourceList: {
              type: "array",
              items: { type: "string" },
              description: "List of sources for the workflow.",
              nullable: true,
            },
            source: {
              type: "string",
              description:
                "REQUIRED: Source of the timeseries data (i.e. NLDAS, GLDAS).",
            },
            dateTimeSpan: { $ref: "#/components/schemas/DateTimeSpan" },
            geometry: { $ref: "#/components/schemas/TimeSeriesGeometry" },
            dataValueFormat: {
              type: "string",
              description:
                "OPTIONAL: Specifies the output format for the data values in the timeseries.\r\nDEFAULT: E3\r\nFormat Reference: https://msdn.microsoft.com/en-us/library/kfsatb94(v=vs.110).aspx",
              nullable: true,
            },
            temporalResolution: {
              type: "string",
              description:
                'OPTIONAL: The temporal resolution of the time series to be returned. Valid options dependent on the dataset and source of the timeseries.\r\nDEFAULT: "default"\r\nVALUES: "default", "hourly", "3hourly", "daily", "monthly"',
              nullable: true,
            },
            timeLocalized: {
              type: "boolean",
              description:
                "OPTIONAL: Indicates if the timezone of the geometry is used for the date/time values of the returned timeseries.\r\nDEFAULT: True",
            },
            units: {
              type: "string",
              description:
                'OPTIONAL: Unit system of the output values.\r\nDEFAULT: "metric"\r\nVALUES: "metric", "imperial"',
              nullable: true,
            },
            outputFormat: {
              type: "string",
              description:
                'OPTIONAL: Specifies output format type.\r\nDEFAULT: "json"\r\nVALUES: "json"',
              nullable: true,
            },
            baseURL: {
              type: "array",
              items: { type: "string" },
              description:
                "Internal: Holds base url for data retrieval depending on the specified source and dataset.",
              nullable: true,
            },
            inputTimeSeries: {
              type: "object",
              additionalProperties: {
                $ref: "#/components/schemas/TimeSeriesOutput",
              },
              description:
                "Optional: A dictionary for utilizing an ITimeSeriesOutput as an input variable, where the key is a provided identifier of the ITimeSeriesOutput.",
              nullable: true,
            },
          },
          description:
            "PrecipitationExtraction Input that implements TimeSeriesInput object.",
        },
        WaterQualityInput: {
          type: "object",
          properties: {
            taskID: {
              type: "string",
              description: "TaskID required for data storage in mongodb",
              nullable: true,
            },
            dataSource: {
              type: "string",
              description:
                "Data source for data retrieval\r\nIf value is 'nldas': surface runoff and subsurface flow will be from nldas (no precip will be downloaded); \r\nIf value is 'ncei', precip data will be downloaded from the closest station to the catchment and curvenumber will be used for surface runoff/subsurface flow.",
              nullable: true,
            },
            minNitrate: { type: "integer", format: "int32" },
            maxNitrate: { type: "integer", format: "int32" },
            minAmmonia: { type: "integer", format: "int32" },
            maxAmmonia: { type: "integer", format: "int32" },
          },
          description:
            "WaterQuality Input that implements TimeSeriesInput object.",
        },
      },
    },
    servers: [
      { url: "https://qed.epacdx.net/hms/rest", description: "HMS Frontend" },
    ],
  };
}
