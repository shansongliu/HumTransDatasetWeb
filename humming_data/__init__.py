import os
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_mail import Mail


app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SECRET_KEY'] = 'thisisfirstflaskapp'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////' + os.path.join(basedir ,'database/humming_dataset_contributors.db')
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://username:password@hostname:port/databasename'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)

app.config['MAIL_SERVER'] = 'smtp.139.com'
app.config['MAIL_PORT'] = 25
app.config['MAIL_USERNAME'] = 'xxxxxxxxxxx'
app.config['MAIL_PASSWORD'] = 'xxxxxxxxxxx'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)
mail.init_app(app)


from humming_data import routes


with app.app_context():
    db.create_all()