import { Injectable } from '@angular/core'
import * as d3 from 'd3'

@Injectable({
    providedIn: 'root',
})
export class GeneExpDataService {
    constructor() {}

    fetchGeneExpData() {
        return fetch('http://localhost:4200/assets/data/expression-data.csv')
            .then(response => response.text())
            .then(data => d3.csvParse(data))
    }
}
