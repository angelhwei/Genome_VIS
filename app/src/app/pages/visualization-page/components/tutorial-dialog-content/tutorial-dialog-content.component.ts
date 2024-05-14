import {Component} from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-tutorial-dialog-content',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './tutorial-dialog-content.component.html',
  styleUrl: './tutorial-dialog-content.component.scss'
})
export class TutorialDialogContentComponent {

}
