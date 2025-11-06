#!/usr/bin/env python3
"""
Test script to verify Firestore connection and create test data
Run this to verify your Firestore setup is working correctly
"""
import sys
import os

# Add parent directory to path to import app
sys.path.insert(0, os.path.dirname(__file__))

try:
    from app import db
    import firebase_admin
    from firebase_admin import firestore
    
    print("Testing Firestore connection...")
    print("=" * 50)
    
    # Test 1: Check if Firestore is initialized
    print("\n1. Checking Firestore connection...")
    test_ref = db.collection('_test').document('connection_test')
    test_ref.set({'test': True, 'timestamp': firestore.SERVER_TIMESTAMP})
    test_ref.delete()
    print("   ✓ Firestore connection successful!")
    
    # Test 2: Check if we can write to users collection
    print("\n2. Testing users collection...")
    test_user_ref = db.collection('users').document('test-user-123')
    test_user_data = {
        'uid': 'test-user-123',
        'name': 'Test User',
        'email': 'test@example.com',
        'phoneNumber': '+1234567890',
        'address': '123 Test St',
        'createdAt': firestore.SERVER_TIMESTAMP,
        'updatedAt': firestore.SERVER_TIMESTAMP,
    }
    test_user_ref.set(test_user_data)
    print("   ✓ Successfully wrote to users collection")
    
    # Verify it was written
    doc = test_user_ref.get()
    if doc.exists:
        print(f"   ✓ Verified: User document exists with name: {doc.to_dict()['name']}")
    
    # Clean up test data
    test_user_ref.delete()
    print("   ✓ Test data cleaned up")
    
    # Test 3: Check if we can write to loginHistory collection
    print("\n3. Testing loginHistory collection...")
    test_login_ref = db.collection('loginHistory').add({
        'uid': 'test-user-123',
        'phoneNumber': '+1234567890',
        'timestamp': firestore.SERVER_TIMESTAMP,
        'userAgent': 'test-script',
        'ipAddress': '127.0.0.1',
    })
    print("   ✓ Successfully wrote to loginHistory collection")
    
    # Clean up test data
    db.collection('loginHistory').document(test_login_ref[1].id).delete()
    print("   ✓ Test data cleaned up")
    
    print("\n" + "=" * 50)
    print("✓ All Firestore tests passed!")
    print("\nYour Firestore is properly configured.")
    print("Collections will appear in Firebase Console after first real data is added.")
    print("\nTo see the collections:")
    print("1. Register a user through the app")
    print("2. Go to Firebase Console → Firestore Database")
    print("3. You'll see 'users' and 'loginHistory' collections")
    
except Exception as e:
    print(f"\n✗ Error: {str(e)}")
    print("\nTroubleshooting:")
    print("1. Make sure serviceAccountKey.json is in the api/ directory")
    print("2. Make sure the Flask API can initialize Firebase Admin SDK")
    print("3. Check that your Firebase project has Firestore enabled")
    sys.exit(1)

