from flask_socketio import SocketIO
from flask import request

user_locations = {}

def setup_socket_events(socketio: SocketIO):
    @socketio.on('connect')
    def handle_connect():
        print(f"Usuario conectado: {request.sid}")

    @socketio.on('sendLocation')
    def handle_location(data):
        user_id = request.sid
        user_locations[user_id] = {
            'lat': data['lat'],
            'lon': data['lon']
        }
        socketio.emit('locationUpdate', user_locations)

    @socketio.on('disconnect')
    def handle_disconnect():
        user_id = request.sid
        if user_id in user_locations:
            del user_locations[user_id]
        socketio.emit('locationUpdate', user_locations)
        print(f"Usuario desconectado: {request.sid}")