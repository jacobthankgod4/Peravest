const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSION = 4096; // 4K max

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

class FileValidator {
  validateImage(file: File): FileValidationResult {
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`
      };
    }

    return { valid: true };
  }

  validateDocument(file: File): FileValidationResult {
    // Check file type
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only PDF and image files are allowed.'
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`
      };
    }

    return { valid: true };
  }

  async validateImageDimensions(file: File): Promise<FileValidationResult> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        
        if (img.width > MAX_IMAGE_DIMENSION || img.height > MAX_IMAGE_DIMENSION) {
          resolve({
            valid: false,
            error: `Image dimensions exceed ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION}px limit.`
          });
        } else {
          resolve({ valid: true });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          valid: false,
          error: 'Failed to load image. File may be corrupted.'
        });
      };

      img.src = url;
    });
  }

  sanitizeFileName(fileName: string): string {
    // Remove special characters and spaces
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  async validateMultipleImages(files: FileList): Promise<FileValidationResult> {
    const filesArray = Array.from(files);

    // Check number of files
    if (filesArray.length > 10) {
      return {
        valid: false,
        error: 'Maximum 10 images allowed.'
      };
    }

    // Validate each file
    for (const file of filesArray) {
      const result = this.validateImage(file);
      if (!result.valid) {
        return result;
      }

      const dimensionResult = await this.validateImageDimensions(file);
      if (!dimensionResult.valid) {
        return dimensionResult;
      }
    }

    return { valid: true };
  }
}

export const fileValidator = new FileValidator();
