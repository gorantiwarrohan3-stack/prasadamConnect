"""
Flask API for Prasadam Connect
Handles user registration and login history
"""
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    # Try to load from environment variable or service account file
    cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
    else:
        # Try to load from serviceAccountKey.json in the api directory
        service_account_path = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')
        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
        else:
            # Use default credentials (for local development with gcloud auth)
            cred = credentials.ApplicationDefault()
    
    firebase_admin.initialize_app(cred)

db = firestore.client()


def validate_email(email):
    """Validate email format"""
    pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return re.match(pattern, email) is not None


def validate_phone(phone):
    """Validate E.164 phone format"""
    pattern = r'^\+\d{10,15}$'
    return re.match(pattern, phone) is not None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'prasadam-connect-api'}), 200


@app.route('/api/register', methods=['POST'])
def register_user():
    """
    Register a new user
    Expected JSON body:
    {
        "uid": "firebase-auth-uid",
        "name": "User Name",
        "email": "user@example.com",
        "phoneNumber": "+1234567890",
        "address": "123 Main St, City, State"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['uid', 'name', 'email', 'phoneNumber', 'address']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        uid = data['uid']
        name = data['name'].strip()
        email = data['email'].strip().lower()
        phone_number = data['phoneNumber'].strip()
        address = data['address'].strip()
        
        # Validate email format
        if not validate_email(email):
            return jsonify({
                'success': False,
                'error': 'Invalid email format'
            }), 400
        
        # Validate phone format
        if not validate_phone(phone_number):
            return jsonify({
                'success': False,
                'error': 'Invalid phone number format. Must be in E.164 format (e.g., +1234567890)'
            }), 400
        
        # Check if user already exists
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        
        if user_doc.exists:
            return jsonify({
                'success': False,
                'error': 'User already registered'
            }), 409
        
        # Check if phone number is already registered
        phone_query = db.collection('users').where('phoneNumber', '==', phone_number).limit(1)
        phone_docs = phone_query.get()
        if phone_docs:
            return jsonify({
                'success': False,
                'error': 'Phone number already registered'
            }), 409
        
        # Check if email is already registered
        email_query = db.collection('users').where('email', '==', email).limit(1)
        email_docs = email_query.get()
        if email_docs:
            return jsonify({
                'success': False,
                'error': 'Email already registered'
            }), 409
        
        # Create user document
        user_data = {
            'uid': uid,
            'name': name,
            'email': email,
            'phoneNumber': phone_number,
            'address': address,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP,
        }
        
        user_ref.set(user_data)
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': {
                'uid': uid,
                'name': name,
                'email': email,
                'phoneNumber': phone_number,
            }
        }), 201
        
    except Exception as e:
        print(f"Error in register_user: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@app.route('/api/check-user', methods=['POST'])
def check_user():
    """
    Check if a user exists by phone number
    Expected JSON body:
    {
        "phoneNumber": "+1234567890"
    }
    """
    try:
        data = request.get_json()
        phone_number = data.get('phoneNumber')
        
        if not phone_number:
            return jsonify({
                'success': False,
                'error': 'Phone number is required'
            }), 400
        
        # Validate phone format
        if not validate_phone(phone_number):
            return jsonify({
                'success': False,
                'error': 'Invalid phone number format'
            }), 400
        
        # Check if user exists
        query = db.collection('users').where('phoneNumber', '==', phone_number).limit(1)
        docs = query.get()
        
        return jsonify({
            'success': True,
            'exists': len(docs) > 0
        }), 200
        
    except Exception as e:
        print(f"Error in check_user: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@app.route('/api/login-history', methods=['POST'])
def record_login():
    """
    Record a login event
    Expected JSON body:
    {
        "uid": "firebase-auth-uid",
        "phoneNumber": "+1234567890"
    }
    """
    try:
        data = request.get_json()
        uid = data.get('uid')
        phone_number = data.get('phoneNumber')
        
        if not uid or not phone_number:
            return jsonify({
                'success': False,
                'error': 'UID and phone number are required'
            }), 400
        
        # Validate phone format
        if not validate_phone(phone_number):
            return jsonify({
                'success': False,
                'error': 'Invalid phone number format'
            }), 400
        
        # Get user agent and IP from request
        user_agent = request.headers.get('User-Agent', 'unknown')
        ip_address = request.remote_addr or request.environ.get('HTTP_X_FORWARDED_FOR', 'unknown')
        
        # Record login history
        login_data = {
            'uid': uid,
            'phoneNumber': phone_number,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'userAgent': user_agent,
            'ipAddress': ip_address,
        }
        
        db.collection('loginHistory').add(login_data)
        
        return jsonify({
            'success': True,
            'message': 'Login recorded successfully'
        }), 201
        
    except Exception as e:
        print(f"Error in record_login: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@app.route('/api/login-history/<uid>', methods=['GET'])
def get_login_history(uid):
    """
    Get login history for a user
    Query params: limit (default: 50, max: 100)
    """
    try:
        if not uid:
            return jsonify({
                'success': False,
                'error': 'UID is required'
            }), 400
        
        # Get limit from query params
        limit = request.args.get('limit', 50, type=int)
        limit = min(limit, 100)  # Cap at 100
        
        # Query login history
        query = db.collection('loginHistory')\
                  .where('uid', '==', uid)\
                  .order_by('timestamp', direction=firestore.Query.DESCENDING)\
                  .limit(limit)
        
        docs = query.get()
        
        history = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            # Convert timestamp if it exists
            if 'timestamp' in data and data['timestamp']:
                if hasattr(data['timestamp'], 'timestamp'):
                    data['timestamp'] = data['timestamp'].timestamp()
            history.append(data)
        
        return jsonify({
            'success': True,
            'history': history,
            'count': len(history)
        }), 200
        
    except Exception as e:
        print(f"Error in get_login_history: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@app.route('/api/user/<uid>', methods=['GET'])
def get_user(uid):
    """
    Get user profile by UID
    """
    try:
        if not uid:
            return jsonify({
                'success': False,
                'error': 'UID is required'
            }), 400
        
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user_data = user_doc.to_dict()
        # Remove sensitive fields if needed
        # user_data.pop('someField', None)
        
        return jsonify({
            'success': True,
            'user': user_data
        }), 200
        
    except Exception as e:
        print(f"Error in get_user: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))  # Changed default to 5001 to avoid AirPlay conflict
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)

