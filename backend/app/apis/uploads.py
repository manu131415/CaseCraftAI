import os
import io
from pathlib import Path
from urllib.parse import urlparse

import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, File, UploadFile, HTTPException
from dotenv import load_dotenv

# Load ENV
load_dotenv(Path(__file__).resolve().parents[2] / ".env")
cloudinary_url = os.getenv("CLOUDINARY_URL")

# Validate Cloudinary configuration
CLOUDINARY_CONFIGURED = False
if cloudinary_url:
    parsed = urlparse(cloudinary_url)
    cloudinary.config(
        cloud_name=parsed.hostname or "",
        api_key=parsed.username or "",
        api_secret=parsed.password or "",
        secure=True,
    )
    CLOUDINARY_CONFIGURED = bool(parsed.hostname)
else:
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
    api_key = os.getenv("CLOUDINARY_API_KEY")
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
    
    if cloud_name and api_key and api_secret:
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True,
        )
        CLOUDINARY_CONFIGURED = True

router = APIRouter(
    prefix="/api",
    tags=["uploads"],
)


@router.post("/upload")
def upload_file(file: UploadFile = File(...)):
    """Upload a file to Cloudinary"""
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        if not CLOUDINARY_CONFIGURED:
            raise HTTPException(
                status_code=500, 
                detail="Cloudinary is not configured. Please set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET in environment variables"
            )
        
        # Read file content
        file_content = file.file.read()
        
        if not file_content:
            raise HTTPException(status_code=400, detail="File is empty")
        
        # Upload to Cloudinary with folder prefix
        result = cloudinary.uploader.upload(
            file_content,
            folder="casecraft/complaints",
            resource_type="auto",
        )
        
        return {
            "url": result.get("secure_url"),
            "secure_url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "filename": file.filename,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )
