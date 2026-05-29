from cryptography.fernet import Fernet
from dotenv import load_dotenv
import os

load_dotenv()


def get_encryption_key() -> str:
    key: str | None = os.getenv("ENCRYPTION_KEY")

    if not key:
        raise ValueError("ENCRYPTION_KEY is not set in the environment variables.")

    return key


fernet = Fernet(get_encryption_key())


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
