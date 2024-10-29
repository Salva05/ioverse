def extract_data(data):
    """
    Extract relevant fields from the incoming request data.

    Args:
        data (dict): The request data.

    Returns:
        dict: A dictionary containing extracted fields with default values where applicable.
    """
    extracted_data = {
        'prompt': data.get('prompt'),
        'model_used': data.get('model_used', 'dall-e-2'),
        'n': data.get('n', 1),
        'quality': data.get('quality'),
        'size': data.get('size'),
        'style': data.get('style'),
        'response_format': data.get('response_format', 'url')
    }
    return extracted_data

def validate_extracted_data(data):
    """
    Validate the extracted data according to business rules.

    Args:
        data (dict): The extracted data.

    Returns:
        dict: A dictionary of validation errors, empty if no errors.
    """
    errors = {}
    
    if not data['prompt'] or not data['prompt'].strip():
        errors['prompt'] = 'Prompt cannot be empty.'
    else:
        max_length = 1000 if data['model_used'] == 'dall-e-2' else 4000
        if len(data['prompt']) > max_length:
            errors['prompt'] = f'Prompt must be less than {max_length} characters.'

    if data['model_used'] == 'dall-e-3':
        if data['n'] != 1:
            errors['n'] = 'For dall-e-3, only n=1 is supported.'

    elif data['model_used'] == 'dall-e-2':
        if not (1 <= data['n'] <= 10):
            errors['n'] = 'For dall-e-2, n must be between 1 and 10.'
        # Quality and style are not supported for 'dall-e-2'

    else:
        errors['model_used'] = 'Invalid model selected.'

    return errors
