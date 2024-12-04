import requests

def verify_openai_api_key(api_key: str):
    """
    Verifies the validity of an OpenAI API key by making a request to the List Models endpoint.

    Args:
        api_key (str): The OpenAI API key to verify.

    Returns:
        dict: A dictionary containing the verification result and any relevant messages.
    """
    url = "https://api.openai.com/v1/models"
    headers = {
        "Authorization": f"Bearer {api_key}"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            # API key is valid
            return {
                "valid": True,
                "message": "API key is valid."
            }
        elif response.status_code == 401:
            # Unauthorized - Invalid API key
            return {
                "valid": False,
                "message": "Invalid API key. Please check and try again."
            }
        elif response.status_code == 429:
            # Too Many Requests - Rate limit exceeded
            return {
                "valid": False,
                "message": "Rate limit exceeded. Please try again later."
            }
        else:
            return {
                "valid": False,
                "message": f"Unexpected error occurred: {response.status_code} - {response.text}"
            }
    except requests.exceptions.RequestException as e:
        return {
            "valid": False,
            "message": f"Request failed: {str(e)}"
        }

if __name__ == "__main__":
    user_api_key = input("Enter your OpenAI API key: ").strip()
    result = verify_openai_api_key(user_api_key)
    
    if result["valid"]:
        print("\033[92m✅ Your API key is valid. You can proceed to use the platform.\033[0m")
    else:
        print(f"\033[91m❌ API Key Verification Failed: {result['message']}\033[0m")