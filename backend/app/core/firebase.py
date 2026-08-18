import firebase_admin
from firebase_admin import credentials

from app.core.config import settings


if not firebase_admin._apps:
    credential = credentials.Certificate(
        {
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "private_key": settings.firebase_private_key,
            "client_email": settings.firebase_client_email,
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    )

    firebase_admin.initialize_app(credential)