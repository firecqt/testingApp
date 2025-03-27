const API_URL = 'http://localhost:5001';

export const processImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('outputName', `processed_${imageFile.name}`);
  
  try {
    console.log(`Uploading image: ${imageFile.name} (${imageFile.size} bytes)`);
    
    const response = await fetch(`${API_URL}/upload-and-scan/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to process image';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('API response:', result);
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const scanDocument = async (imageFile, outputName) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('outputName', outputName);
  
  try {
    console.log(`Scanning document: ${imageFile.name} (${imageFile.size} bytes), output: ${outputName}`);
    
    const response = await fetch(`${API_URL}/upload-and-scan/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to scan document';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log('API response:', result);
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const checkApiHealth = async () => {
  try {
    console.log("Checking API health...");
    const response = await fetch(`${API_URL}/health-check`);
    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    const data = await response.json();
    console.log("API health response:", data);
    return data;
  } catch (error) {
    console.error("API health check error:", error);
    return { status: 'error', message: error.message };
  }
}; 