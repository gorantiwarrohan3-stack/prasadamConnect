#!/usr/bin/env python3
"""
Uninstall all packages listed in requirements.txt
"""
import subprocess
import sys

PACKAGES = [
    'Flask',
    'flask-cors',
    'firebase-admin',
    'python-dotenv',
    'gunicorn',
]

def uninstall_package(package_name):
    """Uninstall a package using pip"""
    try:
        print(f"Uninstalling {package_name}...")
        result = subprocess.run(
            [sys.executable, '-m', 'pip', 'uninstall', '-y', package_name],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print(f"✓ {package_name} uninstalled successfully")
            return True
        else:
            print(f"⚠ {package_name} not found or already uninstalled")
            return False
    except Exception as e:
        print(f"✗ Error uninstalling {package_name}: {e}")
        return False

def main():
    print("Uninstalling packages from requirements.txt...\n")
    
    uninstalled = []
    not_found = []
    
    for package in PACKAGES:
        if uninstall_package(package):
            uninstalled.append(package)
        else:
            not_found.append(package)
    
    print("\n" + "="*50)
    print(f"\n✓ Uninstalled: {len(uninstalled)} package(s)")
    if uninstalled:
        for pkg in uninstalled:
            print(f"  - {pkg}")
    
    if not_found:
        print(f"\n⚠ Not found (may already be uninstalled): {len(not_found)} package(s)")
        for pkg in not_found:
            print(f"  - {pkg}")
    
    print("\nDone!")
    return 0

if __name__ == '__main__':
    sys.exit(main())

