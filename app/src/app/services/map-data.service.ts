import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import * as d3 from 'd3'

@Injectable({
    providedIn: 'root',
})
export class MapDataService {
    private dataUrl = 'assets/data/map_data_general_group.csv' // 确保路径正确

    constructor(private http: HttpClient) {}

    fetchData(): Observable<any> {
        return this.http.get(this.dataUrl, { responseType: 'text' }).pipe(
            map(data => d3.csvParse(data)),
            catchError(this.handleError)
        )
    }

    private handleError(error: any): Observable<never> {
        console.error('An error occurred', error)
        return throwError('Something went wrong; please try again later.')
    }
}
