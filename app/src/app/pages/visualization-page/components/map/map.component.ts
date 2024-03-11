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
                    color: '#4f6d7a',
                    clicked: false,
                }
                this.markers.push(marker)
                // console.log(marker.position)
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
    // <path filter="url(#dropshadow)" stroke="#fff" stroke-width="3" fill="${marker.color}" d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
    // </svg>`
        let svgUrl = 'data:image/svg+xml;utf-8, ' + encodeURIComponent(svgIcon)
        return {
            icon: {
                url: svgUrl,
                scaledSize: new google.maps.Size(30, 35),
            },
            label: {
                color: 'white', // replace 'red' with the color you want to use for the label
                text: marker.name,
                fontSize: '10px',
            },
        }
    }

    onMarkerClick(clickedMarker: MarkerProperties) {
        if (clickedMarker.color == '#4f6d7a') {
            clickedMarker.color = '#e07a5f'
            clickedMarker.clicked = true
        } else {
            clickedMarker.color = '#4f6d7a'
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
}
