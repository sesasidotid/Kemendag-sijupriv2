import { Component, EventEmitter, Output } from '@angular/core';
import * as L from 'leaflet';

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

  @Output() coordinates = new EventEmitter<{ lat: number, lng: number }>();

  private initMap(): void {
    this.map = L.map('map', {
      center: [51.505, -0.09],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
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
    this.marker = L.marker([lat, lng]).addTo(this.map)
      .bindPopup(`Latitude: ${lat}<br>Longitude: ${lng}`)
      .openPopup();

    // Emit the coordinates to the parent component
    this.coordinates.emit({ lat, lng });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }
}
