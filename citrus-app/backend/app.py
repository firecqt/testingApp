from flask import Flask, request, jsonify, send_from_directory
import cv2
import numpy as np
import os
from image_processing import ScanDocument
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow all origins by default

PROCESSED_IMAGE_DIR = './processed_images'
os.makedirs(PROCESSED_IMAGE_DIR, exist_ok=True)

@app.route('/process-image', methods=['POST'])
def process_image():
    file = request.files['image']
    if file:
        # Save the uploaded file temporarily
        image_path = './temp_image.jpg'
        file.save(image_path)
        
        # Process the image using ScanDocument
        processed_image = ScanDocument(image_path, option=2)
        
        # Save the processed image
        processed_image_path = os.path.join(PROCESSED_IMAGE_DIR, 'processed_image.jpg')
        cv2.imwrite(processed_image_path, processed_image)
        
        # Return a URL to access the processed image
        processed_image_url = f'/processed_images/processed_image.jpg'
        return jsonify({'processedImageUrl': processed_image_url})
    return jsonify({'error': 'No image provided'}), 400

@app.route('/processed_images/<filename>')
def send_processed_image(filename):
    return send_from_directory(PROCESSED_IMAGE_DIR, filename)

if __name__ == '__main__':
    app.run(debug=True)
