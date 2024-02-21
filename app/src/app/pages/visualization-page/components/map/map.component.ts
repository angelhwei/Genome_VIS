import { Component, OnInit } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapDataService } from '../../../../services/map-data.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [GoogleMapsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit {
  constructor(private mapDataService: MapDataService) {
    this.center = { lat: 0, lng: 0 };
  }
  zoom = 12;
  center: google.maps.LatLngLiteral;
  // options: google.maps.MapOptions = {
  //   mapTypeId: 'hybrid',
  //   zoomControl: false,
  //   scrollwheel: false,
  //   disableDoubleClickZoom: true,
  //   maxZoom: 15,
  //   minZoom: 8,
  // };

  markers: google.maps.Marker[] = [];
  map!: google.maps.Map;

  ngOnInit() {
    this.mapDataService.fetchData().then((data: any) => {
      console.log(data);
      this.addMarker(data);
      navigator.geolocation.getCurrentPosition((position) => {
        this.center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      });
    });

    this.center = {
      lat: 40.73061, // Replace with your latitude
      lng: -73.935242, // Replace with your longitude
    };
  }

  addMarker(data: any) {
    data.forEach((d: any) => {
      let lat = parseFloat(d.Latitude);
      let lng = parseFloat(d.Longitude);
      console.log(d.Latitude, d.Longitude);

      let marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        label: {
          color: 'red',
          text: 'Marker label ' + (this.markers.length + 1),
        },
        map: this.map, // Assuming you have a map property in your component
        title: 'Marker title ' + (this.markers.length + 1),
      });
      this.markers.push(marker);
      this.center = {
        lat: lat,
        lng: lng,
      };
      console.log(marker);
      console.log(this.markers[0]);
    });
  }
}
