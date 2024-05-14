import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core'
import { GoogleMap, GoogleMapsModule } from '@angular/google-maps'
import { MapDataService } from '../../../../services/map-data.service'
import { CommonModule } from '@angular/common'

interface MarkerProperties {
    position: {
        lat: number
        lng: number
    }
    name: string // Add this line
    color: string
    clicked: boolean
    size: google.maps.Size
}

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [GoogleMapsModule, CommonModule],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit {
    @Output() pinClicked = new EventEmitter<MarkerProperties>()
    constructor(private mapDataService: MapDataService) {
        this.center = { lat: 48.8606, lng: 2.3376 }
    }

    zoom = 10
    center: { lat: number; lng: number }
    markers: MarkerProperties[] = []
    colors = [
        '#b8b8ff',
        '#8fb996',
        '#ffb950',
        '#86bbd8',
        '#f7af9d',
    ]
    selectedColors = [] as Array<string>

    @ViewChild(GoogleMap) map!: GoogleMap

    ngAfterViewInit() {
        const bounds = this.getBounds(this.markers)
        this.map.googleMap?.fitBounds(bounds)
    }

    ngOnInit() {
        this.mapDataService.fetchData().then((data: any) => {
            data.forEach((data: any) => {
                let lat = parseFloat(data.Latitude)
                let lng = parseFloat(data.Longitude)
                let marker = {
                    position: {
                        lat: lat,
                        lng: lng,
                    },
                    name: data.Name,
                    color: '#adb5bd',
                    clicked: false,
                    size: new google.maps.Size(30, 35),
                }
                this.markers.push(marker)
                this.center = {
                    lat: lat + 0.05,
                    lng: lng,
                }
            })
        })
    }

    getIconOptions(marker: MarkerProperties): google.maps.MarkerOptions {
        let svgIcon = `<svg class="pin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
    // <defs>
    //   <filter id="dropshadow" height="130%">
    //     <feDropShadow dx="2" dy="10" stdDeviation="3" flood-color="rgba(26, 58, 70, 0.5)"/>
    //   </filter>
    // </defs>
    // <path filter="url(#dropshadow)" stroke="#fff" stroke-width="20" fill="${marker.color}" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
    // </svg>`
        let svgUrl = 'data:image/svg+xml;utf-8, ' + encodeURIComponent(svgIcon)
        return {
            icon: {
                url: svgUrl,
                scaledSize: marker.size,
            },
            label: {
                color: '#5c677d', // replace 'red' with the color you want to use for the label
                text: marker.name,
                fontSize: '12px',
            },
        }
    }

    onMarkerClick(clickedMarker: MarkerProperties) {
        if (clickedMarker.color == '#adb5bd') {
            clickedMarker.color = this.generateRandomColor()
            clickedMarker.size = new google.maps.Size(35, 40)
            clickedMarker.clicked = true
        } else {
            const index = this.selectedColors.indexOf(clickedMarker.color)
            if (index !== -1) {
                this.selectedColors.splice(index, 1) // Remove the color from the selectedColors array
            }
            clickedMarker.color = '#adb5bd'
            clickedMarker.size = new google.maps.Size(30, 35)
            clickedMarker.clicked = false
        }
        this.pinClicked.emit(clickedMarker)
    }

    getBounds(markers: any) {
        let north
        let south
        let east
        let west

        for (const marker of markers) {
            // set the coordinates to marker's lat and lng on the first run.
            // if the coordinates exist, get max or min depends on the coordinates.
            north = north !== undefined ? Math.max(north, marker.position.lat) : marker.position.lat
            south = south !== undefined ? Math.min(south, marker.position.lat) : marker.position.lat
            east = east !== undefined ? Math.max(east, marker.position.lng) : marker.position.lng
            west = west !== undefined ? Math.min(west, marker.position.lng) : marker.position.lng
        }

        const bounds = { north, south, east, west }

        return bounds
    }

    generateRandomColor() {
        let index = Math.floor(Math.random() * this.colors.length)
        let color = this.colors[index]
        while (this.selectedColors.includes(color)) {
            index = Math.floor(Math.random() * this.colors.length)
            color = this.colors[index]
        }
        if (!this.selectedColors.includes(color)) {
            this.selectedColors.push(color)
        }

        return color
    }

    // generateRandomColor(): string {
    //     const randomR = (Math.floor(Math.random() * 156) + 100).toString(16)
    //     const randomG = (Math.floor(Math.random() * 156) + 100).toString(16)
    //     const randomB = (Math.floor(Math.random() * 156) + 100).toString(16)
    //     return '#' + randomR + randomG + randomB
    // }
}
