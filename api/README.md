# Prasadam Connect Flask API

Flask backend API for handling user registration and login history.

## Setup

### 0. Check Dependencies (Quick Check)

Run the dependency checker to see what's installed:

```bash
python3 check_dependencies.py
```

Or use the automated setup script:

```bash
chmod +x setup.sh
./setup.sh
```

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

Or using a virtual environment (recommended):

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Firebase Admin SDK Setup

You need to set up Firebase Admin SDK credentials. Choose one method:

#### Option 1: Service Account Key (Recommended for local development)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Save the JSON file as `serviceAccountKey.json` in the `api/` directory
6. Add `serviceAccountKey.json` to `.gitignore` (already included)

#### Option 2: Application Default Credentials (For production/cloud)

```bash
gcloud auth application-default login
```

Then set `GOOGLE_APPLICATION_CREDENTIALS` to empty or don't set it.

### 3. Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` if needed (usually defaults are fine for local development).

### 4. Verify Installation

Check if all dependencies are installed:

```bash
python3 check_dependencies.py
```

This will show you which packages are installed and which are missing.

### 5. Run the API

#### Development Mode

```bash
python3 app.py
```

Or:

```bash
python app.py
```

Or with Flask's development server:

```bash
export FLASK_APP=app.py
export FLASK_ENV=development
flask run
```

The API will run on `http://localhost:5000`

#### Production Mode

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### Health Check
- **GET** `/health`
- Returns API status

### Register User
- **POST** `/api/register`
- Body:
  ```json
  {
    "uid": "firebase-auth-uid",
    "name": "User Name",
    "email": "user@example.com",
    "phoneNumber": "+1234567890",
    "address": "123 Main St, City, State"
  }
  ```

### Check User Exists
- **POST** `/api/check-user`
- Body:
  ```json
  {
    "phoneNumber": "+1234567890"
  }
  ```

### Record Login
- **POST** `/api/login-history`
- Body:
  ```json
  {
    "uid": "firebase-auth-uid",
    "phoneNumber": "+1234567890"
  }
  ```

### Get Login History
- **GET** `/api/login-history/<uid>?limit=50`
- Returns login history for a user

### Get User Profile
- **GET** `/api/user/<uid>`
- Returns user profile data

## Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:5000/health

# Check user
curl -X POST http://localhost:5000/api/check-user \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

## CORS

CORS is enabled for all origins. For production, you may want to restrict this to your frontend domain.

