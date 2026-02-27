from gevent import monkey
monkey.patch_all()

from flask import Flask, render_template, request, session, redirect, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = 'jk-voice-xq7p-2024-static'

VOICE_PASSWORD = 'disc rep 5544'

socketio = SocketIO(app, async_mode='gevent', cors_allowed_origins='*')

# {channel_name: {sid: username}}
voice_channels = {
    'general': {},
    'gaming': {}
}


def get_channel_counts():
    return {ch: len(users) for ch, users in voice_channels.items()}


@app.route('/')
def index():
    return render_template('index.html', page='about')


@app.route('/about')
def about():
    return render_template('index.html', page='about')


@app.route('/projects')
def projects():
    return render_template('index.html', page='projects')


@app.route('/pong')
def pong():
    return render_template('index.html', page='pong')


@app.route('/drawing')
def drawing():
    return render_template('index.html', page='drawing')


@app.route('/modern-pirates')
def modern_pirates():
    return render_template('index.html', page='modern-pirates')


@app.route('/best_in_slot')
def best_in_slot():
    return render_template('best_in_slot.html')


@app.route('/voice', methods=['GET', 'POST'])
def voice():
    if request.method == 'POST':
        password = request.form.get('password', '')
        username = request.form.get('username', '').strip() or 'Guest'
        if password == VOICE_PASSWORD:
            session['voice_auth'] = True
            session['voice_username'] = username
            return redirect(url_for('voice'))
        return render_template('voice.html', authenticated=False, error='Incorrect password')

    if not session.get('voice_auth'):
        return render_template('voice.html', authenticated=False, error=None)

    return render_template('voice.html', authenticated=True,
                           username=session.get('voice_username', 'Guest'))


# ── Socket.IO ──────────────────────────────────────────────────────────────────

@socketio.on('connect')
def on_connect():
    if not session.get('voice_auth'):
        return False  # reject unauthenticated connections
    emit('channel_counts', get_channel_counts())


@socketio.on('disconnect')
def on_disconnect():
    sid = request.sid
    for channel, users in voice_channels.items():
        if sid in users:
            username = users.pop(sid)
            leave_room(channel)
            emit('user_left', {'sid': sid, 'username': username}, room=channel)
            emit('channel_counts', get_channel_counts(), broadcast=True)
            break


@socketio.on('join_channel')
def on_join_channel(data):
    if not session.get('voice_auth'):
        return
    sid = request.sid
    channel = data.get('channel')
    username = session.get('voice_username', 'Guest')

    if channel not in voice_channels:
        return

    # Leave any current channel first
    for ch, users in voice_channels.items():
        if sid in users:
            users.pop(sid)
            leave_room(ch)
            emit('user_left', {'sid': sid, 'username': username}, room=ch)

    # Capture existing peers before adding ourselves
    existing_peers = [{'sid': s, 'username': u}
                      for s, u in voice_channels[channel].items()]

    join_room(channel)
    voice_channels[channel][sid] = username

    # Tell new user who's already here — they'll initiate offers
    emit('channel_joined', {'channel': channel, 'peers': existing_peers})

    # Notify others that someone joined
    emit('user_joined', {'sid': sid, 'username': username},
         room=channel, include_self=False)

    emit('channel_counts', get_channel_counts(), broadcast=True)


@socketio.on('leave_channel')
def on_leave_channel():
    sid = request.sid
    username = session.get('voice_username', 'Guest')
    for channel, users in voice_channels.items():
        if sid in users:
            users.pop(sid)
            leave_room(channel)
            emit('user_left', {'sid': sid, 'username': username}, room=channel)
            emit('channel_counts', get_channel_counts(), broadcast=True)
            break


@socketio.on('webrtc_offer')
def on_webrtc_offer(data):
    emit('webrtc_offer', {
        'offer': data['offer'],
        'from_sid': request.sid,
        'username': session.get('voice_username', 'Guest')
    }, room=data['to'])


@socketio.on('webrtc_answer')
def on_webrtc_answer(data):
    emit('webrtc_answer', {
        'answer': data['answer'],
        'from_sid': request.sid
    }, room=data['to'])


@socketio.on('webrtc_ice')
def on_webrtc_ice(data):
    emit('webrtc_ice', {
        'candidate': data['candidate'],
        'from_sid': request.sid
    }, room=data['to'])


if __name__ == '__main__':
    socketio.run(app, debug=True, host='localhost', port=5000,
                 allow_unsafe_werkzeug=True)
