import cv2
import numpy as np
import matplotlib as plot
import os

# Load Image
def LoadImage(imagePath: str) -> np.ndarray:
    image = cv2.imread(imagePath)
    if image is None:
        raise ValueError(f"Image not found at path: {imagePath}")
    return image

# Show Image
def ShowImage(image: np.ndarray, title: str = "Image"):
    cv2.imshow(title, image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

# Convert to Gray
def ConvertToGray(image: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Apply Gaussian Blur
def ApplyGaussianBlur(image: np.ndarray, kernel_size: int = 5, sigma: float = 0) -> np.ndarray:
    return cv2.GaussianBlur(image, (kernel_size, kernel_size), sigma)

# Apply Canny Edge Detection
def ApplyCannyEdgeDetection(image: np.ndarray, threshold1: int, threshold2: int) -> np.ndarray:
    return cv2.Canny(image, threshold1, threshold2)

# Image Closing
def ImageClosing(image: np.ndarray, kernel_size: int = 5, dil_iteration: int = 3, ero_iteration: int = 2) -> np.ndarray:
    kernel = np.ones((kernel_size, kernel_size))
    newImage = cv2.dilate(image, np.ones((5,5)), iterations=dil_iteration)
    newImage = cv2.erode(newImage, np.ones((5,5)), iterations=ero_iteration)
    return newImage

# Contour Coordinate Reordering -->  
# reorder points to top-left, top-right, bottom-right, bottom-left
def contourCoordinateReordering(points):
    points = points.reshape(4, 2)

    orderedPoints = np.zeros((4, 2), dtype=np.float32)
    summ = points.sum(axis=1)
    diff = np.diff(points, axis=1)

    orderedPoints[0] = points[np.argmin(summ)]
    orderedPoints[1] = points[np.argmin(diff)]
    orderedPoints[2] = points[np.argmax(summ)]
    orderedPoints[3] = points[np.argmax(diff)]
    orderedPoints = orderedPoints.reshape((4, 1, 2))
    return orderedPoints

# Find Biggest Contour
def BiggestContour(image: np.ndarray) -> np.ndarray:
    contours, _ = cv2.findContours(image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # deal with curves
    contours = [cv2.convexHull(contour) for contour in contours]
    biggestContour = np.array({})
    maxArea = 0
    for contour in contours:
        area = cv2.contourArea(contour)
        perimeter = cv2.arcLength(contour, True)
        epsilon = .1*perimeter
        approx = cv2.approxPolyDP(contour, epsilon, True)
        if area > maxArea and len(approx) == 4:
            biggestContour = approx
            maxArea = area
    biggestContour = contourCoordinateReordering(biggestContour)
    return biggestContour

# Get M Matrix (Camera Matrix)
def GetMMatrix(source: np.ndarray, destination: np.ndarray) -> np.ndarray:
    return cv2.getPerspectiveTransform(source, destination)

# Warp Perspective
def WarpPerspective(image: np.ndarray, points: np.ndarray, width: int = 2590, height: int = 3340) -> np.ndarray:
    return cv2.warpPerspective(image, points, (width, height))

# Scans Looseleaf
def ScanDocument(imagePath: str, outputPath: str, name: str, threshold1: int = 45, threshold2: int = 125, width: int = 2590, height: int = 3340, option: int = 0) -> np.ndarray:
    image = LoadImage(imagePath)
    grayImage = ConvertToGray(image)
    grayImageBlur = ApplyGaussianBlur(grayImage)
    grayImageEdges = ApplyCannyEdgeDetection(grayImageBlur, threshold1, threshold2)
    grayImageEdgesClosing = ImageClosing(grayImageEdges)
    bigContour = BiggestContour(grayImageEdgesClosing)
    mMatrix = GetMMatrix(np.float32(bigContour), np.float32([ [0, 0], [width, 0], [width, height], [0,height] ]))
    
    # Make sure outputPath exists
    if not os.path.exists(outputPath):
        os.makedirs(outputPath, exist_ok=True)
        
    # Ensure the path ends with a separator
    if not outputPath.endswith('/') and not outputPath.endswith('\\'):
        outputPath = outputPath + '/'
        
    filename = name + ".JPG"
    full_output_path = os.path.join(outputPath, filename)
    
    print(f"Saving processed image to: {full_output_path}")
    
    # colored
    if option == 0:
        paper = WarpPerspective(image, mMatrix, width, height)
    
    # grayscaled
    elif option == 1:
        paper = WarpPerspective(grayImage, mMatrix, width, height)
    
    # binary
    elif option == 2:
        paper = WarpPerspective(grayImage, mMatrix, width, height)
        denoisedImage = cv2.medianBlur(paper, 3)
        blurredDenoisedImage = ApplyGaussianBlur(denoisedImage)
        brightness = 3
        blockSize = 13
        paper = cv2.adaptiveThreshold(blurredDenoisedImage, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, blockSize, brightness)

    # Only save to the processed directory, not to storage root
    try:
        cv2.imwrite(full_output_path, paper)
        if os.path.exists(full_output_path):
            print(f"Successfully saved file to: {full_output_path}")
            return full_output_path
        else:
            print(f"Failed to save file to: {full_output_path}")
            raise Exception(f"Could not save file to {full_output_path}")
    except Exception as e:
        print(f"Error saving file: {str(e)}")
        raise e