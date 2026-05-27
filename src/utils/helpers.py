from cryptography.fernet import Fernet
from dotenv import load_dotenv
import os

load_dotenv()

fernet = Fernet(os.getenv("ENCRYPTION_KEY"))


def encrypt_key(key: str) -> str:
    return fernet.encrypt(key.encode()).decode()


def decrypt_key(encrypted_key: str) -> str:
    return fernet.decrypt(encrypted_key.encode()).decode()