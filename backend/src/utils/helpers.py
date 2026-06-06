"""
This module provides utility helper functions for the application.

It includes functionalities for:
- Retrieving the encryption key from environment variables.
- Encrypting and decrypting sensitive data (like API keys) using Fernet symmetric encryption.
- Extracting text content from potentially complex or chunked Language Model responses.
"""
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import os

load_dotenv()


def get_encryption_key() -> str:
    """
    Retrieves the symmetric encryption key from the environment variables.

    Returns:
        The encryption key string.

    Raises:
        ValueError: If the 'ENCRYPTION_KEY' environment variable is not set.
    """
    key: str | None = os.getenv("ENCRYPTION_KEY")

    if not key:
        raise ValueError("ENCRYPTION_KEY is not set in the environment variables.")

    return key


fernet = Fernet(get_encryption_key())


def encrypt_key(key: str) -> str:
    """
    Encrypts a plaintext string using Fernet symmetric encryption.

    Args:
        key: The plaintext string to encrypt.

    Returns:
        The encrypted string, decoded to utf-8.
    """
    return fernet.encrypt(key.encode()).decode()


def decrypt_key(encrypted_key: str) -> str:
    """
    Decrypts a Fernet-encrypted string back to plaintext.

    Args:
        encrypted_key: The encrypted string to decrypt.

    Returns:
        The decrypted plaintext string, decoded to utf-8.
    """
    return fernet.decrypt(encrypted_key.encode()).decode()


def extract_content(chunk) -> str:
    """
    Extracts text content from a LangChain response chunk.

    LLM responses can sometimes be strings, or lists of blocks (e.g., when
    using certain multimodal or tool-calling models). This function standardizes
    the extraction of text content into a single string.

    Args:
        chunk: The response chunk object from a LangChain model.

    Returns:
        The extracted text content as a string.
    """
    if isinstance(chunk.content, str):
        return chunk.content
    if isinstance(chunk.content, list):
        return "".join(
            block.get("text", "") if isinstance(block, dict) else str(block)
            for block in chunk.content
        )
    return ""
