import jwt
import time
from humming_data import db, login_manager, app
from flask_login import UserMixin
from flask import redirect, url_for
from datetime import datetime
# from authlib.jose import JsonWebSignature
# from itsdangerous.url_safe import URLSafeTimedSerializer as Serializer



@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


@login_manager.unauthorized_handler
def unauthorized():
    return redirect(url_for('register'))


class User(db.Model, UserMixin):
    user_id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(16), unique = True, nullable = False)
    email = db.Column(db.String(60), unique = True, nullable = False)
    password = db.Column(db.String(60), nullable = False)
    audio_file = db.Column(db.String(50), nullable = True, default = 'default.wav')
    date_created = db.Column(db.DateTime, default = datetime.fromtimestamp(time.time()))

    def __repr__(self):
        return f'{self.username} : {self.email} : {self.date_created.strftime("%Y-%m-%d %H:%M:%S")}'

    def get_id(self):
        return self.user_id

    def get_token(self, expires = 300):
        # serial = Serializer(app.config['SECRET_KEY'])
        # return serial.dumps({'user_id': self.user_id})
        return jwt.encode({'reset_password': self.username, 'exp': time.time() + expires},
                          key = app.config['SECRET_KEY'])

    @staticmethod
    def verify_token(token):
        # serial = Serializer(app.config['SECRET_KEY'])
        # try:
        #     user_id = serial.loads(token)['user_id']
        # except:
        #     return None
        # return User.query.get(user_id)
        try:
            username = jwt.decode(token, key = app.config['SECRET_KEY']['reset_password'])
        except:
            return None
        return User.query.filter_by(username = username).first()
