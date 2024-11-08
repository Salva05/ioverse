from django.core.exceptions import ValidationError
import re

# =========================
# Metadata Validators
# =========================

def validate_metadata(metadata):
    """
    Validates the 'metadata' field to ensure it meets the specified constraints.
    - Must be a dictionary.
    - Maximum of 16 key-value pairs.
    - Keys: Strings up to 64 characters.
    - Values: Strings up to 512 characters.
    """
    if not isinstance(metadata, dict):
        raise ValidationError("metadata must be a dictionary.")
    if len(metadata) > 16:
        raise ValidationError("Metadata can have a maximum of 16 key-value pairs.")
    
    for key, value in metadata.items():
        if not isinstance(key, str):
            raise ValidationError("All metadata keys must be strings.")
        if not isinstance(value, str):
            raise ValidationError("All metadata values must be strings.")
        if len(key) > 64:
            raise ValidationError("Metadata keys cannot exceed 64 characters.")
        if len(value) > 512:
            raise ValidationError("Metadata values cannot exceed 512 characters.")

# =========================
# Tool Validators
# =========================

def validate_tools(tools):
    """
    Validates the 'tools' field to ensure it meets the specified constraints.
    - Must be a list.
    - Maximum of 128 tools.
    - Each tool must be a dictionary with a valid 'type'.
    """
    if not isinstance(tools, list):
        raise ValidationError("Tools must be a list.")
    if len(tools) > 128:
        raise ValidationError("A maximum of 128 tools are allowed.")
    
    for tool in tools:
        if not isinstance(tool, dict):
            raise ValidationError("Each tool must be a dictionary.")
        
        tool_type = tool.get('type')
        if tool_type not in ['code_interpreter', 'file_search', 'function']:
            raise ValidationError(f"Invalid tool type: {tool_type}")
        
        # Delegate to specific tool validators
        if tool_type == 'code_interpreter':
            pass # no further validations for it
        elif tool_type == 'file_search':
            validate_file_search(tool)
        elif tool_type == 'function':
            validate_function(tool)

def validate_file_search(tool):
    """
    Validates the 'file_search' tool configuration.
    - Must contain 'vector_store_ids' as a list with a maximum of 1 item.
    - Optional: 'max_num_results' between 1 and 50.
    - Optional: 'score_threshold' between 0 and 1.
    """
    file_search = tool.get('file_search')
    if file_search is None:
        raise ValidationError("Missing 'file_search' configuration.")
    if not isinstance(file_search, dict):
        raise ValidationError("'file_search' must be a dictionary.")
    
    vector_store_ids = file_search.get('vector_store_ids')
    if vector_store_ids is not None:
        if not isinstance(vector_store_ids, list):
            raise ValidationError("'vector_store_ids' must be a list.")
        if len(vector_store_ids) > 1:
            raise ValidationError("A maximum of 1 vector_store_id is allowed in file_search.")
        for vs_id in vector_store_ids:
            if not isinstance(vs_id, str):
                raise ValidationError("Each vector_store_id must be a string.")
    
    max_num_results = file_search.get('max_num_results')
    if max_num_results is not None:
        if not isinstance(max_num_results, int):
            raise ValidationError("'max_num_results' must be an integer.")
        if not (1 <= max_num_results <= 50):
            raise ValidationError("max_num_results must be between 1 and 50.")
    
    ranking_options = file_search.get('ranking_options', {})
    score_threshold = ranking_options.get('score_threshold')
    if score_threshold is not None:
        if not isinstance(score_threshold, (int, float)):
            raise ValidationError("'score_threshold' must be a number.")
        if not (0 <= score_threshold <= 1):
            raise ValidationError("score_threshold must be between 0 and 1.")

def validate_function(tool):
    """
    Validates the 'function' tool configuration.
    - Must contain a 'name' that is alphanumeric with underscores or dashes, up to 64 characters.
    """
    function = tool.get('function')
    if function is None:
        raise ValidationError("Missing 'function' configuration.")
    if not isinstance(function, dict):
        raise ValidationError("'function' must be a dictionary.")
    
    name = function.get('name')
    if name:
        if not isinstance(name, str):
            raise ValidationError("Function name must be a string.")
        if not re.match(r'^[a-zA-Z0-9_-]{1,64}$', name):
            raise ValidationError("Function name must be alphanumeric with underscores or dashes and up to 64 characters.")
    else:
        raise ValidationError("Function 'name' is required.")

# =========================
# Tool Resources Validators
# =========================

def validate_tool_resources(tool_resources):
    """
    Validates the 'tool_resources' field to ensure it meets the specified constraints.
    - Must be a dictionary or null.
    - Can contain specific tool-related resources.
    """
    if tool_resources is None:
        return  # Allow null values
    
    if not isinstance(tool_resources, dict):
        raise ValidationError("tool_resources must be a dictionary or null.")
    
    # Validate specific tool resources if present
    if 'code_interpreter' in tool_resources:
        validate_code_interpreter_resources(tool_resources['code_interpreter'])
    
    if 'file_search' in tool_resources:
        validate_file_search_resources(tool_resources['file_search'])
    
    # Validate embedded metadata if present
    metadata = tool_resources.get('metadata')
    if metadata is not None:
        validate_metadata(metadata)

def validate_code_interpreter_resources(code_interpreter_resources):
    """
    Validates resources specific to the 'code_interpreter' tool within tool_resources.
    - Example: Ensure 'file_ids' list constraints.
    """
    if not isinstance(code_interpreter_resources, dict):
        raise ValidationError("'code_interpreter' resources must be a dictionary.")
    
    file_ids = code_interpreter_resources.get('file_ids')
    if file_ids is not None:
        if not isinstance(file_ids, list):
            raise ValidationError("'file_ids' in tool_resources must be a list.")
        if len(file_ids) > 20:
            raise ValidationError("A maximum of 20 file_ids are allowed in tool_resources 'code_interpreter'.")
        for file_id in file_ids:
            if not isinstance(file_id, str):
                raise ValidationError("Each file_id in tool_resources 'code_interpreter' must be a string.")

def validate_file_search_resources(file_search_resources):
    """
    Validates resources specific to the 'file_search' tool within tool_resources.
    - Example: Ensure 'vector_store_ids' list constraints.
    """
    if not isinstance(file_search_resources, dict):
        raise ValidationError("'file_search' resources must be a dictionary.")
    
    vector_store_ids = file_search_resources.get('vector_store_ids')
    if vector_store_ids is not None:
        if not isinstance(vector_store_ids, list):
            raise ValidationError("'vector_store_ids' in tool_resources must be a list.")
        if len(vector_store_ids) > 1:
            raise ValidationError("A maximum of 1 vector_store_id is allowed in tool_resources 'file_search'.")
        for vs_id in vector_store_ids:
            if not isinstance(vs_id, str):
                raise ValidationError("Each vector_store_id in tool_resources 'file_search' must be a string.")

# =========================
# Response Format Validator
# =========================

def validate_response_format(response_format):
    """
    Validates the 'response_format' field to ensure it meets the specified constraints.
    - Must be either the string 'auto' or a dictionary with a valid 'type'.
    """
    if isinstance(response_format, str):
        if response_format != "auto":
            raise ValidationError("response_format string must be 'auto'.")
    elif isinstance(response_format, dict):
        rf_type = response_format.get('type')
        if rf_type not in ['json_schema', 'json_object', 'text']:
            raise ValidationError("Invalid response_format type.")
        
        if rf_type == 'json_schema':
            schema = response_format.get('json_schema')
            if not isinstance(schema, dict):
                raise ValidationError("json_schema must be a dictionary.")
    else:
        raise ValidationError("Invalid type for response_format.")

# =========================
# Temperature Validator
# =========================

def validate_temperature(v):
    """
    Validates temperature.
    - Allower values are between 0 and 2.
    """
    if v is not None:
        if not (0 <= v <= 2):
            raise ValidationError('Temperature must be between 0 and 2.')
        
# =========================
# Top_p Validator
# =========================

def validate_top_p(v):
    """
    Validates the nucleus sampling for the given model.
    - Allower values are between 0 and 1.
    """
    if v is not None:
        if not (0 <= v <= 1):
            raise ValidationError('Top_p must be between 0 and 1.')
        
# =========================
# Role Validator
# =========================

def validate_role(value):
    """
    Validates that the role is either 'user' or 'assistant'.
    
    - Allowed roles: 'user', 'assistant'.
    """
    allowed_roles = ['user', 'assistant']
    if value not in allowed_roles:
        raise ValidationError(
            f"Invalid role: '{value}'. Allowed roles are {allowed_roles}."
        )


# =========================
# Content Validator
# =========================

def validate_content(content):
    """
    Validates the content array to ensure each item adheres to the specified types and structure.
    
    - Each item must be a dictionary with a valid 'type'.
    - Supported types: 'image_file', 'image_url', 'text', 'refusal'.
    """
    if isinstance(content, list):
        for index, item in enumerate(content):
            if not isinstance(item, dict):
                raise ValidationError(f"Each content item must be a dictionary. Error at index {index}.")
            
            content_type = item.get('type')
            if content_type == 'image_file':
                validate_image_file(item, index)
            elif content_type == 'image_url':
                validate_image_url(item, index)
            elif content_type == 'text':
                validate_text_content(item, index)
            elif content_type == 'refusal':
                validate_refusal(item, index)
            else:
                raise ValidationError(
                    f"Invalid content type: '{content_type}' at index {index}. "
                    "Allowed types are 'image_file', 'image_url', 'text', 'refusal'."
                )


# =========================
# Image File Validator
# =========================

def validate_image_file(item, index):
    """
    Validates the 'image_file' content type.
    
    - Must contain 'image_file' as a dictionary.
    - 'file_id' must be a non-empty string.
    - 'detail' must be either 'low' or 'high'.
    """
    image_file = item.get('image_file')
    if image_file is None:
        raise ValidationError(f"Missing 'image_file' in content item at index {index}.")
    if not isinstance(image_file, dict):
        raise ValidationError(f"'image_file' must be a dictionary in content item at index {index}.")
    
    file_id = image_file.get('file_id')
    if not file_id or not isinstance(file_id, str):
        raise ValidationError(
            f"'file_id' in 'image_file' must be a non-empty string in content item at index {index}."
        )
    
    detail = item.get('detail')
    if detail not in ['low', 'high']:
        raise ValidationError(
            f"'detail' in 'image_file' must be either 'low' or 'high' in content item at index {index}."
        )


# =========================
# Image URL Validator
# =========================

def validate_image_url(item, index):
    """
    Validates the 'image_url' content type.
    
    - Must contain 'image_url' as a dictionary.
    - 'url' must be a valid string ending with a supported image extension.
    - 'detail' must be 'low', 'high', or 'auto' (default is 'auto').
    """
    image_url = item.get('image_url')
    if image_url is None:
        raise ValidationError(f"Missing 'image_url' in content item at index {index}.")
    if not isinstance(image_url, dict):
        raise ValidationError(f"'image_url' must be a dictionary in content item at index {index}.")
    
    url = image_url.get('url')
    if not url or not isinstance(url, str):
        raise ValidationError(
            f"'url' in 'image_url' must be a non-empty string in content item at index {index}."
        )
    
    # Validate URL format and supported image types
    supported_types = ['jpeg', 'jpg', 'png', 'gif', 'webp']
    if not any(url.lower().endswith(f".{ext}") for ext in supported_types):
        raise ValidationError(
            f"Image URL must end with one of the supported types: {supported_types} in content item at index {index}."
        )
    
    detail = item.get('detail', 'auto')
    if detail not in ['low', 'high', 'auto']:
        raise ValidationError(
            f"'detail' in 'image_url' must be 'low', 'high', or 'auto' in content item at index {index}."
        )


# =========================
# Text Content Validator
# =========================

def validate_text_content(item, index):
    """
    Validates the 'text' content type.
    
    - Must contain 'text' as a dictionary.
    - 'value' must be a non-empty string.
    - 'annotations' must be a list if provided.
    """
    text = item.get('text')
    if text is None:
        raise ValidationError(f"Missing 'text' in content item at index {index}.")
    if not isinstance(text, dict):
        raise ValidationError(f"'text' must be a dictionary in content item at index {index}.")
    
    value = text.get('value')
    if not value or not isinstance(value, str):
        raise ValidationError(
            f"'value' in 'text' must be a non-empty string in content item at index {index}."
        )
    
    annotations = item.get('annotations', [])
    if not isinstance(annotations, list):
        raise ValidationError(
            f"'annotations' must be a list in content item at index {index}."
        )
    
    for ann_index, annotation in enumerate(annotations):
        if not isinstance(annotation, dict):
            raise ValidationError(
                f"Each annotation must be a dictionary in content item at index {index}, annotation index {ann_index}."
            )
        
        annotation_type = annotation.get('type')
        if annotation_type == 'file_citation':
            validate_file_citation(annotation, index, ann_index)
        elif annotation_type == 'file_path':
            validate_file_path(annotation, index, ann_index)
        else:
            raise ValidationError(
                f"Invalid annotation type: '{annotation_type}' in content item at index {index}, annotation index {ann_index}."
            )


# =========================
# Refusal Validator
# =========================

def validate_refusal(item, index):
    """
    Validates the 'refusal' content type.
    
    - Must contain 'refusal' as a non-empty string.
    """
    refusal = item.get('refusal')
    if refusal is None:
        raise ValidationError(f"Missing 'refusal' in content item at index {index}.")
    if not isinstance(refusal, str) or not refusal.strip():
        raise ValidationError(
            f"'refusal' must be a non-empty string in content item at index {index}."
        )


# =========================
# File Citation Validator
# =========================

def validate_file_citation(annotation, content_index, ann_index):
    """
    Validates the 'file_citation' annotation type.
    
    - Must contain 'file_id' as a non-empty string.
    - 'start_index' and 'end_index' must be integers.
    """
    file_citation = annotation.get('file_citation')
    if file_citation is None:
        raise ValidationError(
            f"Missing 'file_citation' in annotation at content index {content_index}, annotation index {ann_index}."
        )
    if not isinstance(file_citation, dict):
        raise ValidationError(
            f"'file_citation' must be a dictionary in annotation at content index {content_index}, annotation index {ann_index}."
        )
    
    file_id = file_citation.get('file_id')
    if not file_id or not isinstance(file_id, str):
        raise ValidationError(
            f"'file_id' in 'file_citation' must be a non-empty string in annotation at content index {content_index}, annotation index {ann_index}."
        )
    
    start_index = file_citation.get('start_index')
    end_index = file_citation.get('end_index')
    if not isinstance(start_index, int) or not isinstance(end_index, int):
        raise ValidationError(
            f"'start_index' and 'end_index' in 'file_citation' must be integers in annotation at content index {content_index}, annotation index {ann_index}."
        )


# =========================
# File Path Validator
# =========================

def validate_file_path(annotation, content_index, ann_index):
    """
    Validates the 'file_path' annotation type.
    
    - Must contain 'file_id' as a non-empty string.
    - 'start_index' and 'end_index' must be integers.
    """
    file_path = annotation.get('file_path')
    if file_path is None:
        raise ValidationError(
            f"Missing 'file_path' in annotation at content index {content_index}, annotation index {ann_index}."
        )
    if not isinstance(file_path, dict):
        raise ValidationError(
            f"'file_path' must be a dictionary in annotation at content index {content_index}, annotation index {ann_index}."
        )
    
    file_id = file_path.get('file_id')
    if not file_id or not isinstance(file_id, str):
        raise ValidationError(
            f"'file_id' in 'file_path' must be a non-empty string in annotation at content index {content_index}, annotation index {ann_index}."
        )
    
    start_index = file_path.get('start_index')
    end_index = file_path.get('end_index')
    if not isinstance(start_index, int) or not isinstance(end_index, int):
        raise ValidationError(
            f"'start_index' and 'end_index' in 'file_path' must be integers in annotation at content index {content_index}, annotation index {ann_index}."
        )


# =========================
# Attachments Validator
# =========================

def validate_attachments(attachments):
    """
    Validates the 'attachments' field to ensure it meets the specified constraints.
    
    - Must be a list.
    - Each attachment must contain 'file_id' as a non-empty string.
    - 'tools' must be a list containing valid tool types ('code_interpreter', 'file_search').
    """
    if not isinstance(attachments, list):
        raise ValidationError("Attachments must be a list.")
    
    for index, attachment in enumerate(attachments):
        if not isinstance(attachment, dict):
            raise ValidationError(f"Each attachment must be a dictionary. Error at index {index}.")
        
        file_id = attachment.get('file_id')
        if not file_id or not isinstance(file_id, str):
            raise ValidationError(
                f"'file_id' in attachment must be a non-empty string. Error at index {index}."
            )
        
        tools = attachment.get('tools')
        if not isinstance(tools, list):
            raise ValidationError(
                f"'tools' in attachment must be a list. Error at index {index}."
            )
        
        for tool_index, tool in enumerate(tools):
            if not isinstance(tool, dict):
                raise ValidationError(
                    f"Each tool in 'tools' must be a dictionary. Error at attachment index {index}, tool index {tool_index}."
                )
            
            tool_type = tool.get('type')
            if tool_type not in ['code_interpreter', 'file_search']:
                raise ValidationError(
                    f"Invalid tool type: '{tool_type}' in attachment at index {index}, tool index {tool_index}. "
                    "Allowed types are 'code_interpreter' and 'file_search'."
                )
            
# =========================
# Vector Store Status Validator
# =========================

def validate_vector_store_status(value):
    """
    Validates that the status is one of the allowed choices for VectorStore.
    
    - Allowed statuses: 'expired', 'in_progress', 'completed'.
    """
    allowed_statuses = ['expired', 'in_progress', 'completed']
    if value not in allowed_statuses:
        raise ValidationError(
            f"Invalid status: '{value}'. Allowed statuses are {allowed_statuses}."
        )


# =========================
# Expires After Validator
# =========================

def validate_expires_after(expires_after):
    """
    Validates the 'expires_after' field to ensure it meets the specified constraints.
    
    - Must be a dictionary.
    - 'anchor' must be one of the allowed anchors.
    - 'days' must be a positive integer.
    - 'expires_at' must be an integer or null.
    - 'last_active_at' must be an integer or null.
    """
    if not isinstance(expires_after, dict):
        raise ValidationError("'expires_after' must be a dictionary.")
    
    anchor = expires_after.get('anchor')
    if anchor not in ['last_active_at']:
        raise ValidationError(
            f"Invalid anchor: '{anchor}'. Allowed anchors are ['last_active_at']."
        )
    
    days = expires_after.get('days')
    if not isinstance(days, int) or days <= 0:
        raise ValidationError("'days' must be a positive integer.")
    
    expires_at = expires_after.get('expires_at')
    if expires_at is not None and not isinstance(expires_at, int):
        raise ValidationError("'expires_at' must be an integer or null.")
    
    last_active_at = expires_after.get('last_active_at')
    if last_active_at is not None and not isinstance(last_active_at, int):
        raise ValidationError("'last_active_at' must be an integer or null.")


# =========================
# File Counts Validator
# =========================

def validate_file_counts(file_counts):
    """
    Validates the 'file_counts' field to ensure it meets the specified constraints.
    
    - Must be a dictionary.
    - Keys must be one of the allowed statuses.
    - Values must be non-negative integers.
    """
    allowed_statuses = ['in_progress', 'completed', 'cancelled', 'failed', 'total']
    if not isinstance(file_counts, dict):
        raise ValidationError("'file_counts' must be a dictionary.")
    
    for status, count in file_counts.items():
        if status not in allowed_statuses:
            raise ValidationError(
                f"Invalid status '{status}' in 'file_counts'. Allowed statuses are {allowed_statuses}."
            )
        if not isinstance(count, int) or count < 0:
            raise ValidationError(
                f"Count for status '{status}' in 'file_counts' must be a non-negative integer."
            )

# =========================
# Vector Store File Status Validator
# =========================

def validate_vector_store_file_status(value):
    """
    Validates that the status is one of the allowed choices for VectorStoreFile.

    - Allowed statuses: 'in_progress', 'completed', 'cancelled', 'failed'.
    """
    allowed_statuses = ['in_progress', 'completed', 'cancelled', 'failed']
    if value not in allowed_statuses:
        raise ValidationError(
            f"Invalid status: '{value}'. Allowed statuses are {allowed_statuses}."
        )

# =========================
# Last Error Validator
# =========================

def validate_last_error(last_error):
    """
    Validates the 'last_error' field to ensure it meets the specified constraints.

    - Must be a dictionary or None.
    - If not None, must contain 'code' and 'message'.
    - 'code' must be either 'server_error' or 'rate_limit_exceeded'.
    - 'message' must be a non-empty string.
    """
    if last_error is not None:
        if not isinstance(last_error, dict):
            raise ValidationError("'last_error' must be a dictionary or null.")
        
        code = last_error.get('code')
        message = last_error.get('message')
        
        if code not in ['server_error', 'rate_limit_exceeded']:
            raise ValidationError(
                f"Invalid code in 'last_error': '{code}'. Allowed codes are 'server_error' and 'rate_limit_exceeded'."
            )
        
        if not message or not isinstance(message, str):
            raise ValidationError("'message' in 'last_error' must be a non-empty string.")

# =========================
# Chunking Strategy Validator
# =========================

def validate_chunking_strategy(chunking_strategy):
    """
    Validates the 'chunking_strategy' field to ensure it meets the specified constraints.

    - Must be a dictionary.
    - 'type' must be either 'static' or 'other'.
    - Depending on 'type', validate the nested structure.
    """
    if not isinstance(chunking_strategy, dict):
        raise ValidationError("'chunking_strategy' must be a dictionary.")
    
    strategy_type = chunking_strategy.get('type')
    if strategy_type == 'static':
        validate_static_chunking_strategy(chunking_strategy, 0)
    else:
        raise ValidationError(
            f"Invalid type in 'chunking_strategy': '{strategy_type}'. Allowed types are 'static' and 'other'."
        )

def validate_static_chunking_strategy(chunking_strategy, index):
    """
    Validates the 'static' chunking strategy.

    - 'static' must be a dictionary.
    - 'max_chunk_size_tokens' must be an integer between 100 and 4096.
    - 'chunk_overlap_tokens' must be an integer.
    - 'chunk_overlap_tokens' must not exceed half of 'max_chunk_size_tokens'.
    """
    static = chunking_strategy.get('static')
    if not isinstance(static, dict):
        raise ValidationError("'static' in 'chunking_strategy' must be a dictionary.")
    
    max_chunk_size_tokens = static.get('max_chunk_size_tokens')
    chunk_overlap_tokens = static.get('chunk_overlap_tokens')
    
    if not isinstance(max_chunk_size_tokens, int) or not (100 <= max_chunk_size_tokens <= 4096):
        raise ValidationError(
            f"'max_chunk_size_tokens' must be an integer between 100 and 4096. Received: {max_chunk_size_tokens}."
        )
    
    if not isinstance(chunk_overlap_tokens, int):
        raise ValidationError(
            f"'chunk_overlap_tokens' must be an integer. Received: {chunk_overlap_tokens}."
        )
    
    if chunk_overlap_tokens > (max_chunk_size_tokens // 2):
        raise ValidationError(
            f"'chunk_overlap_tokens' ({chunk_overlap_tokens}) must not exceed half of 'max_chunk_size_tokens' ({max_chunk_size_tokens})."
        )
