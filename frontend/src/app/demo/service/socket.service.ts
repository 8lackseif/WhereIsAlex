import { Injectable } from '@angular/core';
import { io,Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

const SOCKET_ENDPOINT = 'http://localhost:5000';

@Injectable({
  providedIn: 'root'
})

export class SocketService {
  private socket: Socket;
  private locationUpdateSubject = new Subject<any>();

  constructor() {
    this.socket = io(SOCKET_ENDPOINT);

    this.socket.on('locationUpdate', (userLocations: any) => {
      this.locationUpdateSubject.next(userLocations); 
    });
  }

  sendLocation(username: string, location: { latitude: number; longitude: number; }) {
    this.socket.emit('sendLocation', { username, ...location });
  }

  onLocationUpdate() {
    return new Observable<{ latitude: number; longitude: number }>((observer) => {
      this.socket.on('location_update', (data) => {
        observer.next(data);
      });
    });
  }

  getLocationUpdates() {
    return this.locationUpdateSubject.asObservable();
  }

  disconnect(username: string){
      this.socket.emit('user_disconnect', {username});
      this.socket.disconnect();
  }
}
