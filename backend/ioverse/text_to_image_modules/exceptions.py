class TextToImageError(Exception):
    """Base exception class for TextToImage errors."""

class InvalidResponseError(TextToImageError):
    """Exception raised when the API response is invalid."""
