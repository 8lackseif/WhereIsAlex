from flask import Flask
from flask_socketio import SocketIO
from app.config import Config

socketio = SocketIO()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Importar los eventos de Socket.IO
    from app.socket_handlers import setup_socket_events
    setup_socket_events(socketio)

    # Registrar las rutas
    from app.routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    socketio.init_app(app, cors_allowed_origins="*")

    return app