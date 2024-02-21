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
    @ViewChild('svgComponent') svgComponent!: ScaffoldBarchartComponent
    @ViewChild('svgComponent2') svgComponent2!: ScaffoldSequenceComponent
    @ViewChild('container') container!: ElementRef

    ngAfterViewInit() {
        this.updateWidth()
    }

    @HostListener('window:resize')
    onResize() {
        this.updateWidth()
    }

    updateWidth() {
        if (this.svgComponent && this.container) {
            this.svgComponent.width = this.container.nativeElement.offsetWidth
            this.svgComponent2.width = this.container.nativeElement.offsetWidth
        }
    }
}
