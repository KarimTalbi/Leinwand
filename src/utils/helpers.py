from cryptography.fernet import Fernet
from dotenv import load_dotenv
import os

load_dotenv()

fernet = Fernet(os.getenv("ENCRYPTION_KEY"))


def encrypt_key(key: str) -> str:
    return fernet.encrypt(key.encode()).decode()


def decrypt_key(encrypted_key: str) -> str:
    return fernet.decrypt(encrypted_key.encode()).decode()


def extract_content(chunk) -> str:
    if isinstance(chunk.content, str):
        return chunk.content
    if isinstance(chunk.content, list):
        return "".join(
            block.get("text", "") if isinstance(block, dict) else str(block)
            for block in chunk.content
        )
    return ""