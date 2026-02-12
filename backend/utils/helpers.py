from uuid import UUID
from typing import Any


def is_valid_uuid(val: Any) -> bool:
   """check if a value is a vaild UUID or a string representation of one"""
   if isinstance(val, UUID):
       return True
   try:
       UUID(str(val))
       return True
   except (ValueError, TypeError):
       return False