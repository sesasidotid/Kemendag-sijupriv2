import { Component, EventEmitter, Input, input, Output } from '@angular/core';
import * as L from 'leaflet';
import { GeoCodingService } from '../../../base/services/geocoding.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  private map: L.Map;
  private marker: L.Marker;

  placeGeocode: number[];

  markerIcon = L.icon({
    iconSize: [25, 41],
    iconAnchor: [10, 41],
    popupAnchor: [2, -40],
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  })

  @Output() coordinates = new EventEmitter<{ lat: number, lng: number }>();

  @Input() name: string;
  @Input() type: "provinsi" | "kabupaten";

  constructor(private geoCodingService: GeoCodingService) {
  }

  ngOnInit(): void {
    console.log(this.name, this.type);
    if (this.name && this.type) {
      console.log(this.name, this.type);
      this.geoCodingService.getCoordinatesByName(this.name, this.type).subscribe((coordinates) => {
        if (coordinates) {
          this.placeGeocode = coordinates;
        }
      });
    }
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [this.placeGeocode[0], this.placeGeocode[1]],
      // center: [-7.7820975, 110.41519044220186],
      zoom: 13
      
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      // attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.onMapClick(e);
    });
  }

  private onMapClick(e: L.LeafletMouseEvent): void {
    const { lat, lng } = e.latlng;

    // Log latitude and longitude to the console
    console.log(`Latitude: ${lat}, Longitude: ${lng}`);

    // Remove the existing marker if it exists
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }

    // Add a new marker at the clicked location
    this.marker = L.marker([lat, lng], {icon: this.markerIcon}).addTo(this.map)
      .bindPopup(`Latitude: ${lat}<br>Longitude: ${lng}`)
      .openPopup();

    // Emit the coordinates to the parent component
    this.coordinates.emit({ lat, lng });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }
}
