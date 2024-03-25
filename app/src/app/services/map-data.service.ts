import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root',
})
export class MapDataService {
  constructor() {}

  fetchData() {
    return fetch('../../assets/data/map-data.csv')
      .then((response) => response.text())
      .then((data) => d3.csvParse(data));
  }
}
