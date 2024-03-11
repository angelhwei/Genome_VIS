import { Component, ViewChild, AfterViewInit, ElementRef, HostListener } from '@angular/core'
import { NavbarComponent } from '../../components'
import { ScaffoldBarchartComponent } from '../../components'
import { ScaffoldSequenceComponent } from '../../components'
import { MapComponent } from '../../components'
import { GeneExpressionComponent } from '../../components'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatExpansionModule } from '@angular/material/expansion'
import { MatNativeDateModule } from '@angular/material/core'
// import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { ThemePalette } from '@angular/material/core'

@Component({
    selector: 'app-homepage',
    standalone: true,
    imports: [
        NavbarComponent,
        ScaffoldBarchartComponent,
        ScaffoldSequenceComponent,
        MapComponent,
        GeneExpressionComponent,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        MatExpansionModule,
        MatNativeDateModule,

    ],
    templateUrl: './homepage.component.html',
    styleUrl: './homepage.component.scss',
})
export class HomepageComponent implements AfterViewInit {
    // colorControl = new FormControl('warn' as ThemePalette)
    @ViewChild('svgComponent') svgComponent!: ScaffoldBarchartComponent
    @ViewChild('svgComponent2') svgComponent2!: ScaffoldSequenceComponent
    @ViewChild('container') container!: ElementRef

    @ViewChild('svgComponent3') svgComponent3!: GeneExpressionComponent
    @ViewChild('container2') container2!: ElementRef

    ngAfterViewInit() {
        this.updateWidth()
    }

    @HostListener('window:resize')
    onResize() {
        this.updateWidth()
    }

    updateWidth() {
        if (this.svgComponent && this.container) {
            console.log(this.svgComponent3)
            this.svgComponent.width = this.container.nativeElement.offsetWidth
            this.svgComponent.height = this.container.nativeElement.offsetHeight
            this.svgComponent2.width = this.container.nativeElement.offsetWidth
            this.svgComponent3.width = this.container2.nativeElement.offsetWidth
            this.svgComponent3.height = this.container2.nativeElement.offsetHeight
        }
    }
}
