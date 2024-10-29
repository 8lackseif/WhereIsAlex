import { Component,OnDestroy,OnInit,HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { SocketService } from '../../service/socket.service';
import {LeafletService} from "../../service/leaflet.service";

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
})
export class MapComponent implements OnInit, OnDestroy {
  username: string | null = ''
  userLatitude:number
  userLongitude:number
  error:string
  userLocations: any[] = [];
  private map!: any;
  private userMarker: any | undefined;
  constructor(public layoutService: LayoutService, public router: Router,private route:ActivatedRoute, private socketService:SocketService, private mapService: LeafletService) { }

  ngOnInit(){
    this.username = this.route.snapshot.paramMap.get('username');

    this.initMap();
    this.getUserLocation();    
    this.listenForLocationUpdates();
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          this.userLatitude = position.coords.latitude;
          this.userLongitude = position.coords.longitude;

          this.map.setView([this.userLatitude, this.userLongitude], 13);

          if (this.userMarker) {
            this.userMarker.setLatLng([this.userLatitude, this.userLongitude]); 
          } else {
            this.userMarker = this.mapService.L.marker([this.userLatitude, this.userLongitude]).addTo(this.map).bindPopup('You are here!').openPopup();
          }

          this.socketService.sendLocation(this.username, {
            latitude: this.userLatitude,
            longitude: this.userLongitude,
          });
          this.error = null;
        },
        (error) => {
          this.error = 'No se pudo obtener la ubicación.';
        }
      );
    } else {
      this.error = 'La geolocalización no es compatible con este navegador.';
    }
  }

  private listenForLocationUpdates():void {
    this.socketService.getLocationUpdates().subscribe((data) => {
      this.userLocations = data;
      this.map.eachLayer((layer) => {
        if (layer !== this.userMarker && layer instanceof this.mapService.L.Marker) {
          this.map.removeLayer(layer);
        }
      });
      console.log(this.userLocations)
      const markers: any[] = [];
      Object.values(this.userLocations).forEach((user) => {
        const { latitude, longitude, username } = user;
        console.log(username, latitude, longitude);
        if (username !== this.username) {
            const marker = this.mapService.L.marker([latitude, longitude]).addTo(this.map);
            marker.bindTooltip(username, { permanent: true, direction: 'bottom' }).openTooltip();
            markers.push(this.mapService.L.latLng(latitude, longitude));
        }
      });

      if (markers.length > 0) {
        const group = this.mapService.L.latLngBounds(markers);
        this.map.fitBounds(group);
      }
    });
  }

  private initMap(): void {
    var iconDefault = this.mapService.L.icon({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    this.mapService.L.Marker.prototype.options.icon = iconDefault;

    this.map =  this.mapService.L.map('map', {
      center: [0, 0],
      zoom: 2
    });

    const tiles = this.mapService.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    tiles.addTo(this.map);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    this.socketService.disconnect(this.username);
  }

  ngOnDestroy() {
    this.socketService.disconnect(this.username);
  }
}
