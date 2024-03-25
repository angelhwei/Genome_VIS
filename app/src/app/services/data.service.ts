import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor() {}
  fetchData(): Promise<any> {
    return fetch('../../assets/data/newData3.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .catch((error) => {
        console.error(
          'There has been a problem with your fetch operation:',
          error
        );
      });
  }
}
