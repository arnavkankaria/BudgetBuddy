import firebase_admin
from firebase_admin import credentials, auth, firestore

cred = credentials.Certificate("budgetbuddy-backend-service/firebase_key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Ping Firestore to check connection
try:
    ping_result = db.collection("meta_test").document("ping").set({"status": "connected"})
    print("Firebase Firestore DB connection - SUCCESSFUL!!")
except Exception as e:
    print("Firebase Firestore DB connection - FAILED!!", e)


def verify_user_token(token):
    try:
        decoded = auth.verify_id_token(token)
        return decoded['uid']
    except Exception as e:
        return None
