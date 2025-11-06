#!/bin/bash
# Uninstall all packages from requirements.txt

echo "Uninstalling packages from requirements.txt..."
echo ""

# Read packages from requirements.txt and uninstall them
while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    if [[ -z "$line" ]] || [[ "$line" =~ ^#.* ]]; then
        continue
    fi
    
    # Extract package name (remove version specifier)
    package=$(echo "$line" | cut -d'=' -f1 | tr -d ' ')
    
    if [ -n "$package" ]; then
        echo "Uninstalling $package..."
        pip3 uninstall -y "$package" 2>/dev/null || echo "  $package not found or already uninstalled"
    fi
done < requirements.txt

echo ""
echo "Done! All packages from requirements.txt have been uninstalled."

