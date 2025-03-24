import cv2
import numpy as np

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
    newImage = cv2.dilate(image, kernel, iterations=dil_iteration)
    newImage = cv2.erode(newImage, kernel, iterations=ero_iteration)
    return newImage

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

def BiggestContour(image: np.ndarray) -> np.ndarray:
    contours, _ = cv2.findContours(image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
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

def GetMMatrix(source: np.ndarray, destination: np.ndarray) -> np.ndarray:
    return cv2.getPerspectiveTransform(source, destination)

def WarpPerspective(image: np.ndarray, points: np.ndarray, width: int = 2590, height: int = 3340) -> np.ndarray:
    return cv2.warpPerspective(image, points, (width, height))

def ScanDocument(imagePath: str, threshold1: int = 45, threshold2: int = 125, width: int = 2590, height: int = 3340, option: int = 0) -> np.ndarray:
    image = LoadImage(imagePath)
    grayImage = ConvertToGray(image)
    grayImageBlur = ApplyGaussianBlur(grayImage)
    grayImageEdges = ApplyCannyEdgeDetection(grayImageBlur, threshold1, threshold2)
    grayImageEdgesClosing = ImageClosing(grayImageEdges)
    bigContour = BiggestContour(grayImageEdgesClosing)
    mMatrix = GetMMatrix(np.float32(bigContour), np.float32([ [0, 0], [width, 0], [width, height], [0,height] ]))
    
    # colored
    if option == 0:
        paper = WarpPerspective(image, mMatrix, width, height)
        return paper
    
    # grayscaled
    elif option == 1:
        paper = WarpPerspective(grayImage, mMatrix, width, height)
        return paper
    
    # binary
    elif option == 2:
        paper = WarpPerspective(grayImage, mMatrix, width, height)
        denoisedImage = cv2.medianBlur(paper, 3)
        blurredDenoisedImage = ApplyGaussianBlur(denoisedImage)
        brightness = 3
        blockSize = 13
        binary = cv2.adaptiveThreshold(blurredDenoisedImage, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, blockSize, brightness)
        return binary 
