import os
from flask import render_template, url_for, redirect, flash, request, jsonify, send_file
from humming_data import app, db, bcrypt, mail, basedir
from humming_data.forms import RegistrationForm, LoginForm, ResetRequestForm, ResetPasswordForm, AccountUpdateForm
from humming_data.models import User
from flask_login import login_user, logout_user, current_user, login_required
from flask_mail import Message
from werkzeug.utils import secure_filename


@app.route('/')
@app.route('/home')
def homepage():
    return render_template('homepage.html', title = 'Home Page')


def save_audio(audio_file):
    audio_name = audio_file.filename
    audio_path = os.path.join(basedir, 'static/collected_data', audio_name)
    audio_file.save(audio_path)
    return audio_name


@app.route('/account', methods = ['POST', 'GET'])
@login_required
def account():
    return render_template('account.html', title = 'Account', legend = 'Account Details')


@app.route('/get-json-file', methods = ['GET'])
@login_required
def get_json_file():
    json_file = os.path.join(basedir, 'static/main.json')
    return send_file(json_file, mimetype = 'application/json')


@app.route('/status', methods = ['GET'])
@login_required
def status():
    username = current_user.username
    return render_template('status.html', title = 'Status', legend = 'Account Status', username = username)


@app.route('/get-recorded-music-count')
@login_required
def get_recorded_music_count():

    def count_files_with_suffix(path, suffix):
        count = 0
        for filename in os.listdir(path):
            filepath = os.path.join(path, filename)
            if os.path.isdir(filepath):
                count += count_files_with_suffix(filepath, suffix)
            elif filename.endswith(suffix):
                count += 1
        return count

    user_folder = os.path.join(basedir, 'static/collected_data', current_user.username)
    # recorded_files_count = count_files_with_suffix(user_folder, '.ogg')
    recorded_files_count = count_files_with_suffix(user_folder, '.mp3')
    return str(recorded_files_count)


@app.route('/get-music-folders/<username>')
@login_required
def get_music_folders(username):
    user_folder = os.path.join(basedir, 'static/collected_data', username)
    music_folders = [f for f in os.listdir(user_folder) if os.path.isdir(os.path.join(user_folder, f))]
    return jsonify(sorted(music_folders))


@app.route('/get-music/<folder_name>', methods = ['GET'])
@login_required
def get_music(folder_name):
    audio_files = []
    user_music_folder = os.path.join(basedir, 'static/collected_data', current_user.username, folder_name)
    for filename in os.listdir(user_music_folder):
        # if filename.endswith('.ogg'):
        if filename.endswith('.mp3'):
            audio_files.append(filename)
    return jsonify(sorted(audio_files))


@app.route('/display-music/<folder_name>', methods = ['GET'])
@login_required
def display_music(folder_name):
    username = current_user.username
    return render_template('music.html', title = 'Status', legend = 'Account Status', username = username)


@app.route('/delete-music/<folder_name>/<audio_file>', methods = ['POST'])
@login_required
def delete_music(folder_name, audio_file):
    os.remove(os.path.join(basedir, 'static/collected_data', current_user.username, folder_name, audio_file))
    return 'Delet successful', 200


@app.route('/delete-folder/<folder_name>', methods = ['POST'])
def delete_folder(folder_name):
    # Delete the folder and all its contents from the server
    folder_path = os.path.join(basedir, 'static/collected_data', current_user.username, folder_name)
    os.rmdir(folder_path)
    return 'Folder deleted successfully', 200


@app.route('/upload', methods = ['POST', 'GET'])
@login_required
def upload():
    music_folder = request.form['musicName']
    clip_name = request.form['clipName']
    # audio_filename = clip_name + '.ogg'
    audio_filename = clip_name + '.mp3'
    audio_filename = secure_filename(audio_filename)
    user_folder = os.path.join(basedir, 'static/collected_data', current_user.username)
    user_music_folder = os.path.join(user_folder, music_folder)
    os.makedirs(user_music_folder, exist_ok = True)
    user_audio_filepath = os.path.join(user_music_folder, audio_filename)
    audio_blob = request.files['audioBlob']
    audio_blob.save(user_audio_filepath)
    return 'Upload successful', 200


@app.route('/music-list')
def music_list():
    music_dir = os.path.join(basedir,'static/play_data')
    # music_files = sorted([f for f in os.listdir(music_dir) if f.endswith('.ogg')])
    music_files = sorted([f for f in os.listdir(music_dir) if f.endswith('.mp3')])
    music_files = [os.path.splitext(f)[0] for f in music_files]
    return jsonify(music_files)


@app.route('/register', methods = ['POST', 'GET'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('account'))
    form = RegistrationForm()
    if form.validate_on_submit():
        user_check = User.query.filter_by(username = form.username.data).first()
        if user_check:
            flash(f'Acount for \'{form.username.data}\' exists! Please use a new username!', category = 'danger')
            return redirect(url_for('register'))
        else:
            user_folder = os.path.join(basedir, 'static/collected_data', form.username.data)
            os.makedirs(user_folder, exist_ok = True)
            encrypted_password = bcrypt.generate_password_hash(form.password.data)
            user = User(username = form.username.data, email = form.email.data, password = encrypted_password)
            db.session.add(user)
            db.session.commit()
            flash(f'Account created successfully for {form.username.data}', category = 'success')
            return redirect(url_for('login'))
    return render_template('register.html', title = 'Register', form = form)


@app.route('/login', methods = ['POST', 'GET'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('account'))
    form = LoginForm()
    if form.validate_on_submit():
        username_check = User.query.filter_by(username = form.username.data).first()
        user_email_check = User.query.filter_by(email = form.username.data).first()
        if (username_check or user_email_check):
            user = username_check if username_check else user_email_check
            if bcrypt.check_password_hash(user.password, form.password.data):
                login_user(user)
                flash(f'Login successfully for {form.username.data}', category = 'success')
                user_folder = os.path.join(basedir, 'static/collected_data', user.username)
                os.makedirs(user_folder, exist_ok = True)
                return redirect(url_for('account'))
            else:
                flash(f'Account \'{form.username.data}\' password is incorrect, please try again!', category = 'danger')
        else:
            flash(f'Account \'{form.username.data}\' does not exist, please try again!', category = 'danger')
    return render_template('login.html', title = 'Login', form = form, legend = 'Login here')


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))


def send_mail(user):
    token = user.get_token()
    msg = Message()
    msg.subject = "Password reset request"
    msg.recipients = [user.email]
    msg.sender = "puuu541m@outlook.com"
    msg.body = f'''
        To reset your password. Please follow the link below:

        {url_for('reset_token', token = token, _external = True)}

        If you didn't send a password reset request. Please ignore this message.

    '''
    mail.send(msg)


@app.route('/reset_password', methods = ['POST', 'GET'])
def reset_request():
    form = ResetRequestForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email = form.email.data).first()
        if user:
            send_mail(user)
            flash(f'Reset request sent. Please check your email \'{form.email.data}\'.', category = 'success')
            return redirect(url_for('login'))
    return render_template('reset_request.html', title = 'Reset Request', form = form, legend = "Reset your password here")


@app.route('/reset_password/<token>', methods = ['POST', 'GET'])
def reset_token(token):
    user = User.verify_token(token)
    if user is None:
        flash('Invalid token! Please try again.', category = 'warning')
        return redirect(url_for('reset_request'))

    form = ResetPasswordForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data)
        user.password = hashed_password
        db.session.commit()
        flash('Password changed! Pleas login!', category = 'success')
        return redirect(url_for('login'))
    return render_template('change_password.html', title = 'Change Password', legend = 'Change Password', form = form)