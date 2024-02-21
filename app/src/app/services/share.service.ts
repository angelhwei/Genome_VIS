import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShareService {
  private data = new BehaviorSubject<any>(null);
  currentData = this.data.asObservable();

  changeData(newData: any) {
    this.data.next(newData);
  }
}
