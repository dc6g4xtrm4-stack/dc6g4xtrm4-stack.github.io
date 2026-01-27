# Jack Koehler - Portfolio & Games

A Flask-based web application with portfolio pages and interactive games.

## Project Structure

```
.
├── app.py                 # Flask application with routes
├── requirements.txt       # Python dependencies
├── static/
│   ├── style.css         # Main stylesheet
│   └── games/
│       ├── catan.js
│       ├── pong.js
│       ├── drawing.js
│       ├── survival.js
│       └── modern-pirates.js
└── templates/
    └── index.html        # Main HTML template with Jinja2
```

## Setup & Installation

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

2. **Activate the virtual environment:**
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask app:**
   ```bash
   python app.py
   ```

5. **Access the site:**
   Open your browser and go to `http://localhost:5000`

## Routes

The application has the following routes:

- `/` - Home (About page)
- `/about` - About page
- `/projects` - Projects page
- `/contact` - Contact page
- `/catan` - Catan-like board game
- `/pong` - Pong game
- `/drawing` - Drawing board
- `/survival` - Survival game
- `/modern-pirates` - Modern Pirates game

Each route serves the same template with a `page` variable that determines which section is active.

## Features

- **Sidebar Navigation**: Fixed sidebar with navigation buttons
- **Multiple Games**: Interactive games built with HTML5 Canvas
- **Responsive Design**: Mobile-friendly layout
- **Modern Pirates Game**: Grid-based sailing game with wind mechanics, islands, and turn-based combat

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Canvas Games**: HTML5 Canvas API
- **Styling**: CSS3 Flexbox

## Games

### Modern Pirates
A turn-based exploration and sailing game where players race to 25 points by discovering islands and engaging in sea battles. Features:
- 80x40 grid-based board
- 20 auto-generated islands
- Wind mechanics with realistic sailing rules
- Turn-based 2-player gameplay
- Card deck system
- Point tracking and win condition

### Other Games
- **Catan**: Resource trading board game
- **Pong**: Classic Pong game vs AI
- **Drawing**: Persistent drawing canvas
- **Survival**: First-person survival game
