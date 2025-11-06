#!/usr/bin/env python3
"""
Check if all required dependencies are installed for Flask API
"""
import sys
import importlib

REQUIRED_PACKAGES = {
    'flask': 'Flask',
    'flask_cors': 'flask-cors',
    'firebase_admin': 'firebase-admin',
    'dotenv': 'python-dotenv',
    'gunicorn': 'gunicorn',
}

def check_package(package_name, display_name):
    """Check if a package is installed"""
    try:
        importlib.import_module(package_name)
        print(f"✓ {display_name} is installed")
        return True
    except ImportError:
        print(f"✗ {display_name} is NOT installed")
        return False

def main():
    print("Checking Python dependencies for Flask API...\n")
    print(f"Python version: {sys.version}\n")
    
    all_installed = True
    missing_packages = []
    
    for package, display_name in REQUIRED_PACKAGES.items():
        if not check_package(package, display_name):
            all_installed = False
            missing_packages.append(display_name)
    
    print("\n" + "="*50)
    
    if all_installed:
        print("\n✓ All required dependencies are installed!")
        print("\nYou can run the Flask API with:")
        print("  python3 app.py")
    else:
        print(f"\n✗ Missing {len(missing_packages)} package(s)")
        print("\nTo install missing dependencies, run:")
        print("  pip3 install -r requirements.txt")
        print("\nOr install individually:")
        for pkg in missing_packages:
            print(f"  pip3 install {pkg}")
    
    # Check for virtual environment
    in_venv = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    if in_venv:
        print("\n✓ Virtual environment detected")
    else:
        print("\n⚠ No virtual environment detected (recommended to use one)")
        print("  Create one with: python3 -m venv venv")
        print("  Activate with: source venv/bin/activate")
    
    return 0 if all_installed else 1

if __name__ == '__main__':
    sys.exit(main())

