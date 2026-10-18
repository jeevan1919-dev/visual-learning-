import os
import uuid
from pathlib import Path
from typing import Optional
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR

    def save_file(self, user_id: str, original_filename: str, content: bytes) -> str:
        """Save file to storage and return relative storage path."""
        # Sanitize filename
        safe_name = "".join(c for c in original_filename if c.isalnum() or c in "._- ")
        ext = Path(safe_name).suffix.lower()
        if ext != ".pdf":
            ext = ".pdf"

        unique_id = uuid.uuid4().hex[:12]
        stored_filename = f"{unique_id}_{safe_name}"

        user_dir = self.upload_dir / user_id
        user_dir.mkdir(parents=True, exist_ok=True)

        destination = user_dir / stored_filename

        # Security: protect against path traversal
        resolved = destination.resolve()
        if not str(resolved).startswith(str(self.upload_dir.resolve())):
            raise ValueError("Invalid storage path")

        with open(destination, "wb") as f:
            f.write(content)

        # Return relative storage path
        return f"{user_id}/{stored_filename}"

    def get_file_path(self, storage_path: str) -> Path:
        """Resolve full local file path from storage_path."""
        full_path = (self.upload_dir / storage_path).resolve()
        if not str(full_path).startswith(str(self.upload_dir.resolve())):
            raise ValueError("Access denied: Invalid path")
        if not full_path.exists():
            raise FileNotFoundError(f"File not found: {storage_path}")
        return full_path

    def delete_file(self, storage_path: str) -> bool:
        """Delete file from storage."""
        try:
            full_path = self.get_file_path(storage_path)
            if full_path.exists():
                os.remove(full_path)
                return True
        except Exception:
            pass
        return False

storage_service = StorageService()
