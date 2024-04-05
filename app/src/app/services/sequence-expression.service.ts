import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SequenceExpressionService {
    private data = new BehaviorSubject<any>(null)
    private gene = new BehaviorSubject<any>(null)
    currentData = this.data.asObservable()
    genHasMu = this.gene.asObservable()

    changeData(newData: any) {
        this.data.next(newData)
    }
    geneHasMu(data: any){
        this.gene.next(data)
    }
}
