import firebase_admin
from firebase_admin import credentials, auth, firestore


class FirebaseService:
    def __init__(self):
        if not firebase_admin._apps:
            cred = credentials.Certificate("budgetbuddy-backend-service/firebase_key.json")
            firebase_admin.initialize_app(cred)

        self.db = firestore.client()
        try:
            self.db.collection("meta_test").document("ping").set({"status": "connected"})
            print("Firebase Firestore DB connection - SUCCESSFUL!!")
        except Exception as e:
            print("Firebase Firestore DB connection - FAILED!!", e)

    def verify_user_token(self, token):
        try:
            decoded = auth.verify_id_token(token)
            return decoded['uid']
        except Exception:
            return None