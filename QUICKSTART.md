# Quick Start Guide

Welcome! This repository contains two main projects:
1. **Flask Portfolio Website** - A web application with portfolio pages and browser-based games
2. **Modern Pirates Unity Game** - A standalone Unity game project

## 🌐 Flask Portfolio Website - Quick Start

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Setup in 3 Steps

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Flask app:**
   ```bash
   python app.py
   ```

3. **Open in browser:**
   Navigate to `http://localhost:5000`

That's it! The website should now be running locally.

### Available Pages

Once running, you can access:
- **Home/About**: `http://localhost:5000/` or `http://localhost:5000/about`
- **Projects**: `http://localhost:5000/projects`
- **Pong Game**: `http://localhost:5000/pong`
- **Drawing Board**: `http://localhost:5000/drawing`
- **Modern Pirates (Browser)**: `http://localhost:5000/modern-pirates`

### Using a Virtual Environment (Recommended)

For a cleaner setup, use a virtual environment:

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

### Deployment to GitHub Pages

This repository is configured for GitHub Pages. The Flask app is for local development, while the static `index.html` is served on GitHub Pages.

To deploy updates:
1. Make your changes
2. Commit and push to the `main` branch
3. GitHub Pages will automatically update at: `https://dc6g4xtrm4-stack.github.io`

## 🎮 Modern Pirates Unity Game - Quick Start

The Unity game project is located in the `ModernPiratesUnity/` folder.

### Quick Summary

1. **Install Unity Hub** and Unity 2022.3.0f1 (LTS)
2. **Open the project** from `ModernPiratesUnity/` folder
3. **Create an empty scene** (File > New Scene)
4. **Add a manager script** to an empty GameObject:
   - `BoardGameManager` for turn-based board game
   - `CombatManager` for ship combat
   - `OpenWorldManager` for exploration mode
5. **Press Play ▶️**

Everything (camera, lighting, ships, islands) is created automatically!

### Full Unity Documentation

For detailed Unity game instructions, see:
- [ModernPiratesUnity/QUICKSTART.md](ModernPiratesUnity/QUICKSTART.md) - Comprehensive Unity setup guide
- [ModernPiratesUnity/README.md](ModernPiratesUnity/README.md) - Full game documentation

## 📚 Additional Documentation

- **FLASK_README.md** - Detailed Flask app structure and features
- **MIGRATION_SUMMARY.md** - Information about Flask migration
- **TASK_COMPLETION.md** - Recent Unity refactoring details

## 🆘 Troubleshooting

### Flask App Issues

**Port already in use:**
```bash
# Change the port in app.py, line 30:
app.run(debug=True, host='localhost', port=5001)
```

**Module not found errors:**
```bash
# Make sure you're in the project root and have installed dependencies
pip install -r requirements.txt
```

**Virtual environment not activating:**
- On Windows, you may need to run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Then try activating again

### Unity Game Issues

See the [ModernPiratesUnity/QUICKSTART.md](ModernPiratesUnity/QUICKSTART.md#troubleshooting) troubleshooting section.

## 🚀 What's Next?

### For the Flask Website:
- Customize content in `templates/index.html`
- Modify styles in `static/style.css`
- Add new games in `static/games/`
- Add new routes in `app.py`

### For the Unity Game:
- Open the Unity project and explore the game modes
- Customize colors and gameplay in the manager scripts
- See the Unity documentation for adding features

## 📞 Need Help?

- Check the detailed documentation in the respective README files
- Review the inline code comments
- For Unity-specific questions: [Unity Documentation](https://docs.unity3d.com/)
- For Flask questions: [Flask Documentation](https://flask.palletsprojects.com/)

---

**Quick recap:**
- Flask website: `pip install -r requirements.txt` → `python app.py` → Open `http://localhost:5000`
- Unity game: Open in Unity → Add manager script → Press Play ▶️
