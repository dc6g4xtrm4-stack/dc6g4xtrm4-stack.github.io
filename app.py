from flask import Flask, render_template

app = Flask(__name__, template_folder='templates', static_folder='static')

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

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
