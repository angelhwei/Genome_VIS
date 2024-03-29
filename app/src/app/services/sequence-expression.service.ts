import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SequenceExpressionService {
    private data = new BehaviorSubject<any>(null)
    currentData = this.data.asObservable()

    changeData(newData: any) {
        this.data.next(newData)
    }
}
