import { Injectable } from '@angular/core'
import * as d3 from 'd3'

@Injectable({
    providedIn: 'root',
})
export class GeneExpDataService {
    constructor() {}

    fetchGeneExpData() {
        return fetch('../../assets/data/exp_data_general_group.csv')
            .then(response => response.text())
            .then(data => d3.csvParse(data))
    }
}

