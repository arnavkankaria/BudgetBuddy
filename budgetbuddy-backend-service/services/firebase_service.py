import firebase_admin
from firebase_admin import credentials, auth, firestore

cred = credentials.Certificate("/Users/shireenmeher/Documents/compsci520/BudgetBuddy/firebase_key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

def verify_user_token(token):
    try:
        decoded = auth.verify_id_token(token)
        return decoded['uid']
    except Exception as e:
        return None
