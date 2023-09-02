from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileAllowed
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length, EqualTo


class RegistrationForm(FlaskForm):
    username = StringField(label = 'Username',
                           validators = [DataRequired(), Length(min = 4, max = 16)])
    email = StringField(label = 'Email',
                        validators = [DataRequired(), Length(min = 4, max = 60)])
    password = PasswordField(label = 'Password',
                             validators = [DataRequired(), Length(min = 4, max = 16)])
    confirm_password = PasswordField(label = 'Confirm Password',
                                     validators = [DataRequired(), EqualTo('password')])
    submit = SubmitField(label = 'Sign Up')


class LoginForm(FlaskForm):
    username = StringField(label = 'Username',
                           validators = [DataRequired(), Length(min = 4, max = 60)])
    password = PasswordField(label = 'Password',
                             validators = [DataRequired(), Length(min = 4, max = 16)])
    submit = SubmitField(label = 'Login')


class ResetRequestForm(FlaskForm):
    email = StringField(label = 'Email',
                        validators = [DataRequired()])
    submit = SubmitField(label = 'Reset Password',
                         validators = [DataRequired()])


class ResetPasswordForm(FlaskForm):
    password = PasswordField(label = 'Password',
                             validators = [DataRequired(), Length(min = 4, max = 16)])
    confirm_password = PasswordField(label = 'Confirm Password',
                                     validators = [DataRequired(), EqualTo('password')])
    submit = SubmitField(label = 'Change Password',
                         validators = [DataRequired()])


class AccountUpdateForm(FlaskForm):
    audio = FileField(label = 'Upload Audio File',
                      validators = [FileAllowed(['wav'])])
    submit = SubmitField(label = 'Submit File')


class UploadFileForm(FlaskForm):
    audio = FileField(label = 'Audio')
    clip_name = StringField("clip_name")