# Unity Demo Project

A minimal Unity demo project featuring a simple rotating cube scene.

## Overview

This is a simple Unity project created to test and demonstrate basic Unity functionality and CI/CD pipeline integration. It serves as a minimal working example alongside the more complex Modern Pirates Unity project.

## Features

- **Simple Demo Scene**: A basic scene with a rotating cube
- **Minimal Dependencies**: Uses only core Unity packages
- **Clean Structure**: Organized project structure for easy navigation
- **Pipeline Testing**: Designed to validate Unity build pipelines

## Project Structure

```
DemoUnity/
├── Assets/
│   ├── Scenes/
│   │   └── DemoScene.unity    # Main demo scene with rotating cube
│   └── Scripts/
│       └── RotateCube.cs      # Simple rotation script
├── Packages/
│   └── manifest.json          # Package dependencies
└── ProjectSettings/           # Unity project settings
```

## Getting Started

### Prerequisites

- Unity 6000.3.5f2 (or compatible version)
- Git

### Opening the Project

1. Clone the repository
2. Open Unity Hub
3. Click "Add" and navigate to the `DemoUnity` folder
4. Open the project in Unity Editor

### Running the Demo

1. Open the `DemoScene` scene from `Assets/Scenes/`
2. Press the Play button in the Unity Editor
3. Watch the cube rotate!

## Scripts

### RotateCube.cs

A simple script that rotates the cube continuously:
- Rotates around the Y-axis (vertical)
- Rotates around the X-axis (horizontal) at half speed
- Configurable rotation speed (default: 50 degrees/second)

## Unity Version

This project uses Unity 6000.3.5f2. If you're using a different version, Unity may prompt you to upgrade or downgrade the project.

## Purpose

This demo project serves several purposes:
1. **Pipeline Testing**: Validate Unity build and deployment pipelines
2. **Learning Resource**: Simple example for Unity beginners
3. **Testing Ground**: Safe environment to test new Unity features
4. **Minimal Reference**: Clean baseline for starting new Unity projects

## Comparison with Modern Pirates

Unlike the more complex Modern Pirates Unity project, this demo:
- Has minimal dependencies
- Contains a single simple scene
- Uses basic Unity components
- Is designed for quick testing and validation

## License

This project is part of the dc6g4xtrm4-stack.github.io repository and is available for educational purposes.

## Contributing

This is a minimal demo project. For more complex Unity development, see the Modern Pirates Unity project in the parent repository.
