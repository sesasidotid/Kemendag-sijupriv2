import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms'
import { Router } from '@angular/router'
import { LucideAngularModule, SquareX, SquareCheck } from 'lucide-angular'
import * as L from 'leaflet'

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  currentYear: number = new Date().getFullYear()
  isMenuOpen = false
  ukomForm!: FormGroup
  private map: L.Map | undefined
  greenIcon = L.icon({
    iconUrl: 'leaf-green.png',
    shadowUrl: 'leaf-shadow.png',

    iconSize: [38, 95], // size of the icon
    shadowSize: [50, 64], // size of the shadow
    iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62], // the same for the shadow
    popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
  })

  readonly SquareX = SquareX
  readonly SquareCheck = SquareCheck

  constructor (private router: Router) {}

  ngOnInit () {
    this.ukomForm = new FormGroup({
      ukomCode: new FormControl('', [
        Validators.required,
        // Validators.pattern('^[0-9]+$'),
        Validators.minLength(5)
      ])
    })
    // this.initMap();
  }

  // private initMap(): void {
  //   // Initialize the map centered on a specific location
  //   this.map = L.map('map').setView([-6.181208158854943, 106.83293511707309], 14); // Coordinates for London, you can change these

  //   // Add OpenStreetMap tiles to the map
  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     maxZoom: 19,
  //     // attribution: '&copy; OpenStreetMap contributors'
  //   }).addTo(this.map);

  //   // Define marker coordinates
  //   const markerCoords: [number, number] = [-6.181208158854943, 106.83293511707309]; // Change this to your desired coordinates
  //   const locationName = 'Kementerian Perdagangan Republik Indonesia'; // Custom name for the location

  //   // Create a marker and add it to the map
  //   const marker = L.marker(markerCoords).addTo(this.map)

  //   // HTML content for the popup
  //   const popupContent = `
  //     <div style="">
  //       <p style="font-size: 18px">${locationName}</p>
  //       <p>Jl. M.I. Ridwan Rais, No. 5 Daerah Khusus Ibukota Jakarta 10110, Indonesia</p>
  //       <button
  //         onclick="window.open('https://maps.app.goo.gl/sfw8grHrxJA9nxtV8', '_blank')"
  //         style="margin-top: 5px; padding: 5px 10px; border: none; background-color: #007BFF; color: white; cursor: pointer; border-radius: 5px;">
  //         Buka Google Maps
  //       </button>
  //     </div>
  //   `;

  //   // Set the popup content for the marker
  //   marker.bindPopup(popupContent).openPopup();
  // }

  toggleMenu () {
    this.isMenuOpen = !this.isMenuOpen
  }

  onSubmit () {
    if (this.ukomForm.valid) {
      console.log(this.ukomForm.value)

      //   this.router.navigate(['/page/ukom/' + this.ukomForm.value.ukomCode])
      this.router.navigate(['/ukom/external/status'], {
        queryParams: { key: this.ukomForm.value.ukomCode }
      })

      // this.authService.login(this.auth).subscribe({
      //   next: (authResponse: AuthResponse) => {
      //     this.authResponse = authResponse;
      //     LoginContext.storeContextLocalStorage(this.authResponse);
      //   },
      //   complete: () => {
      //     this.router.navigate(['']).then(() => {
      //       window.location.reload();
      //     });
      //   }
      // });
    }
  }
}
