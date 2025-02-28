import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'

@Injectable({
    providedIn: 'root',
})
export class DataService {
    private dataUrl = 'assets/data/gene_data_general_group.json' // 确保路径正确

    constructor(private http: HttpClient) {}

    fetchData(): Observable<any> {
        return this.http.get<any>(this.dataUrl).pipe(catchError(this.handleError))
    }

    private handleError(error: any): Observable<never> {
        console.error('An error occurred', error)
        return throwError('Something went wrong; please try again later.')
    }
}
