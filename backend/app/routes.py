from flask import Blueprint

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return "API de geolocalización con Flask y Socket.IO"