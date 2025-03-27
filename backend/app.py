from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
import os
import uuid
import shutil
from function import ScanDocument  # Correct import name
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get the project root directory (parent of the backend directory)
PROJECT_ROOT = Path(__file__).parent.parent.absolute()

# Define storage paths - use absolute paths to avoid issues
STORAGE_DIR = "/Users/akkilin/Documents/GitHub/testingApp/storage"
UPLOADS_DIR = os.path.join(STORAGE_DIR, "uploads")
PROCESSED_DIR = os.path.join(STORAGE_DIR, "processed")

# Create directories if they don't exist
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

print(f"Storage directories initialized:")
print(f"Uploads: {UPLOADS_DIR}")
print(f"Processed: {PROCESSED_DIR}")

app = FastAPI(title="Document Scanner API")

# Configure CORS to allow requests from your React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the pdfs directory to serve PDF files
app.mount("/pdfs", StaticFiles(directory="pdfs"), name="pdfs")

# Mount the storage/processed directory to serve processed files correctly
app.mount("/files", StaticFiles(directory=PROCESSED_DIR), name="files")

# Also mount the storage directory root to serve files
app.mount("/storage", StaticFiles(directory=STORAGE_DIR), name="storage")

class ScanRequest(BaseModel):
    imagePath: str
    outputName: str

@app.post("/scan-document/")
async def scan_document(request: ScanRequest):
    """
    Scan an image that's already on the server using the ScanDocument function
    """
    try:
        # Prepare output path
        pdf_path = os.path.join("pdfs", request.outputName)
        
        # Call the ScanDocument function
        # Assuming ScanDocument returns the path to the generated PDF
        result = ScanDocument(request.imagePath, os.path.join(os.getcwd(), "pdfs"), request.outputName, option=2)
        
        return {
            "success": True,
            "filename": request.outputName,
            "pdf_url": f"/pdfs/{request.outputName}",
            "result": result
        }
    except Exception as e:
        print(f"Error scanning document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error scanning document: {str(e)}")

@app.post("/upload-and-scan/")
async def upload_and_scan(image: UploadFile = File(...), outputName: str = Form(...)):
    """
    Upload an image and scan it using the ScanDocument function
    """
    logger.info(f"Received upload request for file: {image.filename}, output name: {outputName}")
    
    if not image.content_type.startswith("image/"):
        logger.warning(f"Invalid file type: {image.content_type}")
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Generate unique filename
        temp_filename = f"{uuid.uuid4()}{os.path.splitext(image.filename)[1]}"
        temp_filepath = os.path.join(UPLOADS_DIR, temp_filename)
        
        # Save uploaded file
        logger.info(f"Saving uploaded file to: {temp_filepath}")
        with open(temp_filepath, "wb") as buffer:
            content = await image.read()
            buffer.write(content)
        
        if not os.path.exists(temp_filepath):
            logger.error(f"Failed to save file to {temp_filepath}")
            raise HTTPException(status_code=500, detail="Failed to save uploaded file")
        
        file_size = os.path.getsize(temp_filepath)
        logger.info(f"File saved successfully: {file_size} bytes")
        
        # Prepare output filename (without extension)
        output_base = os.path.splitext(outputName)[0]
        
        # Make sure processed directory exists
        os.makedirs(PROCESSED_DIR, exist_ok=True)
        logger.info(f"Ensuring processed directory exists: {PROCESSED_DIR}")
        
        # Process image with ScanDocument
        logger.info(f"Processing image with ScanDocument: input={temp_filepath}, output_dir={PROCESSED_DIR}, name={output_base}")
        try:
            # Call ScanDocument function - make sure to pass the directory, not the full path
            result_path = ScanDocument(temp_filepath, PROCESSED_DIR, output_base)
            logger.info(f"ScanDocument result: {result_path}")
        except Exception as e:
            logger.error(f"Error in ScanDocument: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")
        
        # Expected output file (ScanDocument adds .JPG extension)
        output_file = f"{output_base}.JPG"
        expected_output_path = os.path.join(PROCESSED_DIR, output_file)
        
        # Check for the file in multiple locations
        file_locations = [
            expected_output_path,
            os.path.join(STORAGE_DIR, output_file),
            result_path if result_path else None
        ]
        
        found_file_path = None
        for path in file_locations:
            if path and os.path.exists(path):
                found_file_path = path
                logger.info(f"Found output file at: {found_file_path}")
                break
        
        if not found_file_path:
            logger.error(f"Output file not found in any of these locations: {file_locations}")
            raise HTTPException(status_code=500, detail="Processing completed but output file not found")
        
        # If the file isn't in the processed directory, copy it there
        if found_file_path != expected_output_path:
            try:
                shutil.copy2(found_file_path, expected_output_path)
                logger.info(f"Copied file to processed directory: {expected_output_path}")
                found_file_path = expected_output_path
            except Exception as e:
                logger.warning(f"Failed to copy file to processed directory: {str(e)}")
        
        # Clean up temporary file
        try:
            os.remove(temp_filepath)
            logger.info(f"Temporary file removed: {temp_filepath}")
        except Exception as e:
            logger.warning(f"Failed to remove temporary file: {str(e)}")
        
        # After processing is complete, check if a duplicate file exists in storage root
        output_file = f"{output_base}.JPG"
        expected_output_path = os.path.join(PROCESSED_DIR, output_file)
        storage_path = os.path.join(STORAGE_DIR, output_file)
        
        # If a file with the same name exists in the storage root, remove it 
        if os.path.exists(storage_path) and os.path.exists(expected_output_path):
            try:
                os.remove(storage_path)
                logger.info(f"Removed duplicate file from storage root: {storage_path}")
            except Exception as e:
                logger.warning(f"Failed to remove duplicate file: {str(e)}")
        
        # Return success response with multiple URLs for the frontend to try
        # Extract just the filename from the found path
        filename = os.path.basename(found_file_path)
        
        return {
            "success": True,
            "filename": filename,
            "pdf_url": f"/files/{filename}",  # Try the mounted processed directory
            "storage_url": f"/storage/{filename}",  # Try the mounted storage directory
            "direct_url": f"/get-file/processed/{filename}",  # Try direct file access
            "file_path": found_file_path  # Return the actual path for debugging
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/health-check")
async def health_check():
    """
    Simple endpoint to check if the API is running
    """
    # Check directories exist
    storage_exists = os.path.exists(STORAGE_DIR)
    uploads_exists = os.path.exists(UPLOADS_DIR)
    processed_exists = os.path.exists(PROCESSED_DIR)
    
    # Try to write a test file to check permissions
    can_write_uploads = False
    can_write_processed = False
    
    try:
        test_uploads_path = os.path.join(UPLOADS_DIR, "test_permission.txt")
        with open(test_uploads_path, "w") as f:
            f.write("test")
        os.remove(test_uploads_path)
        can_write_uploads = True
    except Exception as e:
        logger.warning(f"Cannot write to uploads directory: {str(e)}")
    
    try:
        test_processed_path = os.path.join(PROCESSED_DIR, "test_permission.txt")
        with open(test_processed_path, "w") as f:
            f.write("test")
        os.remove(test_processed_path)
        can_write_processed = True
    except Exception as e:
        logger.warning(f"Cannot write to processed directory: {str(e)}")
    
    return {
        "status": "ok",
        "directories": {
            "storage_dir": STORAGE_DIR,
            "uploads_dir": UPLOADS_DIR,
            "processed_dir": PROCESSED_DIR
        },
        "directory_exists": {
            "storage": storage_exists,
            "uploads": uploads_exists,
            "processed": processed_exists
        },
        "write_permissions": {
            "uploads": can_write_uploads,
            "processed": can_write_processed
        }
    }

@app.get("/list-files")
async def list_files():
    """
    List all files in the uploads and processed directories
    """
    uploads_files = []
    processed_files = []
    
    if os.path.exists(UPLOADS_DIR):
        uploads_files = os.listdir(UPLOADS_DIR)
    
    if os.path.exists(PROCESSED_DIR):
        processed_files = os.listdir(PROCESSED_DIR)
    
    return {
        "uploads_directory": UPLOADS_DIR,
        "processed_directory": PROCESSED_DIR,
        "uploads_files": uploads_files,
        "processed_files": processed_files
    }

@app.get("/health")
async def health():
    """
    Simple health check endpoint (alias for health-check)
    """
    return await health_check()

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Document Scanner API"}

@app.get("/get-file/{file_type}/{filename}")
async def get_file(file_type: str, filename: str):
    """
    Serve a file directly from storage
    file_type can be 'processed', 'uploads', or 'root'
    """
    if file_type == 'processed':
        file_path = os.path.join(PROCESSED_DIR, filename)
    elif file_type == 'uploads':
        file_path = os.path.join(UPLOADS_DIR, filename)
    elif file_type == 'root':
        file_path = os.path.join(STORAGE_DIR, filename)
    else:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        raise HTTPException(status_code=404, detail="File not found")
    
    logger.info(f"Serving file: {file_path}")
    return FileResponse(file_path)

@app.get("/debug-files")
async def debug_files():
    """Debug endpoint to check for files in storage directories"""
    processed_files = []
    uploads_files = []
    storage_files = []
    
    if os.path.exists(PROCESSED_DIR):
        processed_files = os.listdir(PROCESSED_DIR)
    
    if os.path.exists(UPLOADS_DIR):
        uploads_files = os.listdir(UPLOADS_DIR)
        
    if os.path.exists(STORAGE_DIR):
        storage_files = [f for f in os.listdir(STORAGE_DIR) 
                         if os.path.isfile(os.path.join(STORAGE_DIR, f))]
    
    # For each processed file, check if it's accessible
    processed_file_details = []
    for filename in processed_files:
        file_path = os.path.join(PROCESSED_DIR, filename)
        file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
        processed_file_details.append({
            "filename": filename,
            "path": file_path,
            "size": file_size,
            "exists": os.path.exists(file_path),
            "url": f"/files/{filename}"
        })
    
    # Check root storage files
    storage_file_details = []
    for filename in storage_files:
        file_path = os.path.join(STORAGE_DIR, filename)
        file_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
        storage_file_details.append({
            "filename": filename,
            "path": file_path,
            "size": file_size,
            "exists": os.path.exists(file_path),
            "url": f"/storage/{filename}"
        })
    
    return {
        "processed_dir": PROCESSED_DIR,
        "uploads_dir": UPLOADS_DIR,
        "storage_dir": STORAGE_DIR,
        "processed_files": processed_file_details,
        "uploads_files": uploads_files,
        "storage_files": storage_file_details
    }

@app.get("/file-info/{filename}")
async def file_info(filename: str):
    """
    Check if a file exists in various locations and return information about it
    """
    possible_locations = [
        {"name": "processed", "path": os.path.join(PROCESSED_DIR, filename)},
        {"name": "storage_root", "path": os.path.join(STORAGE_DIR, filename)},
        {"name": "uploads", "path": os.path.join(UPLOADS_DIR, filename)},
        {"name": "pdfs", "path": os.path.join(os.getcwd(), "pdfs", filename)},
    ]
    
    results = []
    for location in possible_locations:
        exists = os.path.exists(location["path"])
        size = os.path.getsize(location["path"]) if exists else 0
        url = f"/{location['name']}/{filename}" if exists else None
        
        if location["name"] == "processed":
            url = f"/files/{filename}" if exists else None
        elif location["name"] == "storage_root":
            url = f"/storage/{filename}" if exists else None
        elif location["name"] == "pdfs":
            url = f"/pdfs/{filename}" if exists else None
        
        results.append({
            "location": location["name"],
            "path": location["path"],
            "exists": exists,
            "size": size,
            "url": url
        })
    
    return {
        "filename": filename,
        "locations": results,
        "access_urls": [loc["url"] for loc in results if loc["exists"] and loc["url"]]
    }

# Add this to your app startup to confirm directory mounting
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting server with the following configurations:")
    logger.info(f"Storage directory: {STORAGE_DIR}")
    logger.info(f"Uploads directory: {UPLOADS_DIR}")
    logger.info(f"Processed directory: {PROCESSED_DIR}")
    
    # Check if directories exist and have files
    if os.path.exists(PROCESSED_DIR):
        files = os.listdir(PROCESSED_DIR)
        logger.info(f"Files in processed directory: {files}")
    
    if os.path.exists(STORAGE_DIR):
        files = [f for f in os.listdir(STORAGE_DIR) if os.path.isfile(os.path.join(STORAGE_DIR, f))]
        logger.info(f"Files in storage root directory: {files}")
    
    # Verify that all directories are properly mounted
    logger.info("Mounted directories:")
    logger.info(f"  /files/ -> {PROCESSED_DIR}")
    logger.info(f"  /storage/ -> {STORAGE_DIR}")
    logger.info(f"  /pdfs/ -> {os.path.join(os.getcwd(), 'pdfs')}")

if __name__ == "__main__":
    logger.info("Starting server on port 5001")
    uvicorn.run("app:app", host="0.0.0.0", port=5001, reload=True) 