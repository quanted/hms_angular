import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayerService {
  overlays: {
        'Watershed Boundary Line': 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/0',
        HUC2: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/1',
        HUC4: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/2',
        HUC6: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/3',
        HUC8: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/4',
        HUC10: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/5',
        HUC12: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/6',
        HUC14: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/MapServer/7'
      }

  constructor() { }
}
