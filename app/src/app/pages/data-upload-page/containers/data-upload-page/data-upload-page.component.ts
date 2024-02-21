import { Component } from '@angular/core';
import { DataUploadComponent } from '../../components/ingex';

@Component({
  selector: 'app-data-upload-page',
  standalone: true,
  imports: [ DataUploadComponent],
  templateUrl: './data-upload-page.component.html',
  styleUrl: './data-upload-page.component.scss'
})
export class DataUploadPageComponent {

}
