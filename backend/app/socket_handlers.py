from flask import Flask
from flask_socketio import SocketIO,emit
from datetime import datetime, timedelta
import threading
import time
from flask import jsonify
import json


user_sessions = {}
user_locations = {}

INACTIVITY_LIMIT = timedelta(seconds=30)

def setup_socket_events(socketio: SocketIO):
    @socketio.on('connect')
    def handle_connect():
        print("User connected")
        socketio.emit('locationUpdate', user_locations)

    @socketio.on('sendLocation')
    def handle_location(data):
        username = data['username']
        latitude = data['latitude']
        longitude = data['longitude']
        user_sessions[username] = {
            'last_active': datetime.now(),
        }
        user_locations[username] = {
            'username': username,
            'latitude': latitude,
            'longitude': longitude
        }
        print(f"Location received from {username}")
        socketio.emit('locationUpdate', user_locations)

    def json_serial(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        raise TypeError(f"Type {type(obj)} not serializable")

    def check_for_inactive_users():
        while True:
            current_time = datetime.now()
            for username in list(user_sessions.keys()):
                if current_time - user_sessions[username]['last_active'] > INACTIVITY_LIMIT:
                    print(f"User {username} has been inactive. Disconnecting...")
                    del user_sessions[username]
                    del user_locations[username]
                    socketio.emit('locationUpdate', user_locations)
            time.sleep(5)

    threading.Thread(target=check_for_inactive_users, daemon=True).start()

    @socketio.on('disconnect')
    def handle_disconnect():
        print("User disconnected")
