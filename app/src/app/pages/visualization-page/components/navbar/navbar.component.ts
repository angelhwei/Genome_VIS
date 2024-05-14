import { Component } from '@angular/core'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button'
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule, MatTooltipModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
    constructor(public dialog: MatDialog) {}

    openDialog() {
        const dialogRef = this.dialog.open(TutorialDialogContentComponent)

        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`)
        })
    }
}
@Component({
    selector: 'app-tutorial-dialog-content',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: '../tutorial-dialog-content/tutorial-dialog-content.component.html',
    styleUrl: '../tutorial-dialog-content/tutorial-dialog-content.component.scss',
})
export class TutorialDialogContentComponent {}
