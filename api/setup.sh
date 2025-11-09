#!/bin/bash
# Setup script for Flask API dependencies

echo "Setting up Flask API dependencies..."
echo ""

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo "✗ Python 3 is not installed"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
echo "✓ Found: $PYTHON_VERSION"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

echo ""
echo "Activating virtual environment..."
source venv/bin/activate

echo ""
echo "Installing dependencies from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "Checking installed packages..."
python3 check_dependencies.py

echo ""
echo "Setup complete!"
echo ""
echo "To run the API:"
echo "  1. Activate virtual environment: source venv/bin/activate"
echo "  2. Run the API: python3 app.py"
echo ""
echo "Don't forget to:"
echo "  - Add serviceAccountKey.json to the api/ directory"
echo "  - Configure .env file if needed"

