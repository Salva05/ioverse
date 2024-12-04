from chatbot_modules.core.chatbot import Chatbot
from chatbot_modules.services.openai_service import OpenAIService
from chatbot_modules.core.chat_logic_service import ChatLogicService
from chatbot_modules.exceptions import MessageLengthException
from pydantic import BaseModel, Field
from typing import Dict, Optional, Union, List
from typing_extensions import Literal
import logging

logger = logging.getLogger(__name__)

#######################################
# Schema for Response Format generation
#######################################

class Schema(BaseModel):
    type: Literal["object", "array", "string", "number", "boolean"]
    properties: Optional[Dict[str, "Schema"]]
    items: Optional[Union["Schema", List["Schema"]]]
    enum: Optional[List[str]]
    description: Optional[str]
    required: List[str]
    additionalProperties: Optional[bool]

    class Config:
        arbitrary_types_allowed = True

Schema.model_rebuild()

class ResponseFormat(BaseModel):
    """
    Represents a response format for Structured Outputs in the OpenAI API.
    """
    name: str
    description: Optional[str]
    schema: Schema = Field(default_factory=lambda: Schema(type="object"))
    strict: Optional[bool]

#########################################
# Pydantic models for Function generation
#########################################

class Properties(BaseModel):
    type: Literal["object", "array", "string", "number", "boolean"]
    description: Optional[str]
    properties: Optional[Dict[str, "Properties"]]
    required: Optional[List[str]]

    class Config:
        arbitrary_types_allowed = True

Properties.model_rebuild()
    
class Parameters(BaseModel):
    type: Literal["object"]
    properties: Optional[Dict[str, Properties]]
    required: Optional[List[str]]
    additionalProperties: Optional[bool]
        
class Function(BaseModel):
    """
    Represents the Function tool as the structured output the OpenAI 
    model has to utilize for its response.
    """
    name: str
    description: str
    parameters: Parameters
    strict: bool

##########################
# Services for generations
##########################

class TaskGeneratorService:
    """
    AI-powered task generator.
    
    Can generate three types of tasks:
    - System Instruction for a gpt model
    - Function tool for Assistant API ( compatible also with Chat Completions API )
    - Json Schema response format for Assistant API ( compatible also with Chat Completions API )
    """
    def __init__(self, api_key: str) -> None:
        """
        Initializes a Chatbot instance for task generation.
        
        - Default model: chatgpt-4o-latest
        """
        openai_service = OpenAIService(api_key=api_key)
        chat_logic_service = ChatLogicService()
        
        self.chatbot = Chatbot(
            ai_service=openai_service,
            chat_logic=chat_logic_service,
            model="chatgpt-4o-latest",
        )
    
    def generate_system_instructions(self, prompt):
        """
        Generates System Instructions for a OpenAI Assistant API / Chat Completions API-compatible 
        model given an user prompt
        """
        sys_instructions = (
            "You generates system instructions usable from an AI. "
            "Your task is to translate a user's high-level requirements into precise, machine-readable system instructions. "
            "Ensure that the output directly addresses the Assistant role with second-person language."
            "The output must explicitly define the Assistant's purpose, scope, and behavior based on the user's prompt. "
            "Follow these guidelines:\n"
            "- Begin the instruction by specifying the Assistant's identity and role.\n"
            "- Clearly outline what the Assistant can do, providing explicit instructions.\n"
            "- Tailor the instructions for use with OpenAI's GPT models, ensuring clarity, relevance, and consistency.\n"
            "- You must respond with a single, complete message. No further follow-up messages are allowed.\n"
            "- Respond in plain text, without using an type of formatting, and don't be too verbose."
            "Always prioritize direct, unambiguous language to make the instructions actionable and effective."
        )
        self.chatbot.reset(system_instructions=sys_instructions)
        return self.chatbot.get_response(prompt)

    def generate_function_tool(self, prompt):
        """
        Generates a function definition for Assistant's tools 
        according to OpenAI Assistant API, given a user prompt
        and a Pydantic model representing the JSON schema the model has to output.
        """
        sys_instructions = (
            "Given a user prompt describing the function, you should output a JSON object that defines the function. Extract information as the function's parameters and the return value."
            "The object must include 'name', 'description', 'parameters', and 'strict' fields, with 'parameters' containing a valid JSON Schema object that defines the function's parameters. "
            "If needed, make parameter field to be recursive."
            "Here are examples of valid function definitions:\n\n"
            "Example 1:\n"
            "{\n"
            '  "name": "get_weather",\n'
            '  "description": "Fetches weather information for a specific location.",\n'
            '  "parameters": {\n'
            '    "type": "object",\n'
            '    "properties": {\n'
            '      "location": {\n'
            '        "type": "string",\n'
            '        "description": "The city and state, e.g., San Francisco, CA"\n'
            '      },\n'
            '      "unit": {\n'
            '        "type": "string",\n'
            '        "enum": ["c", "f"]\n'
            '      }\n'
            '    },\n'
            '    "required": ["location", "unit"],\n'
            '    "additionalProperties": false\n'
            '  },\n'
            '  "strict": true\n'
            "}\n\n"
            "Example 2:\n"
            "{\n"
            '  "name": "calculate_product",\n'
            '  "description": "Calculates the product of two numbers.",\n'
            '  "parameters": {\n'
            '    "type": "object",\n'
            '    "properties": {\n'
            '      "number1": {\n'
            '        "type": "number",\n'
            '        "description": "The first number."\n'
            '      },\n'
            '      "number2": {\n'
            '        "type": "number",\n'
            '        "description": "The second number."\n'
            '      }\n'
            '    },\n'
            '    "required": ["number1", "number2"],\n'
            '    "additionalProperties": false\n'
            '  },\n'
            '  "strict": true\n'
            "}\n\n"
            "Generate the function definition accordingly."
        )
        self.chatbot.reset(system_instructions=sys_instructions)
        try:
            function_definition = self.chatbot.get_structured_output(
                prompt=prompt,
                response_format=Function
            )
            if function_definition:
                return function_definition.model_dump(exclude_none=True)
            else:
                logger.error("Failed to generate function definition.")
                return None
        except MessageLengthException as e:
            logger.error(f"Error: {e}")
            return "Token limit reached"
        except Exception as e:
            logger.error(f"Error: {e}")
            
    def generate_schema(self, prompt):
        """
        Generates a schema representing the model's response format
        according to OpenAI Structured Output API, given a user prompt
        and a Pydantic model representing the JSON schema the model has to output.
        """
        sys_instructions = (
            "You will generate a JSON Schema."
            "Given a prompt describing the expected output, produce a valid JSON object that includes:\n"
            "- 'name': A unique name for the schema, adhering to alphanumeric characters, underscores, or dashes.\n"
            "- 'description': A short description of the response format's purpose.\n"
            "- 'schema': A valid JSON Schema object defining the structure of the response.\n"
            "- 'strict': A boolean indicating whether strict schema adherence is required.\n"
            "Ensure the schema matches the user's requirements and adheres to OpenAI's Structured Outputs limitations.\n"
            "Use examples provided to guide your response."
            "IMPORTANT: Every attribute defined in the 'properties' field MUST be included in the 'required' list of the schema. Even if the user specifies that some attributes are optional, the schema must still treat all attributes as required by default."
            "Here are examples of valid json schemas:\n\n"
            "Example 1:\n"
            "{\n"
            '  "name": "content_compliance",\n'
            '  "schema": {\n'
            '    "type": "object",\n'
            '    "properties": {\n'
            '      "violates": {\n'
            '        "type": "boolean",\n'
            '        "description": "Indicates whether the content violates policies."\n'
            '      },\n'
            '      "violation_categories": {\n'
            '        "type": "array",\n'
            '        "description": "Categories under which the content violates policies.",\n'
            '        "items": {\n'
            '          "type": "string",\n'
            '          "enum": [\n'
            '            "sexual",\n'
            '            "violence",\n'
            '            "self_harm"\n'
            '          ]\n'
            '        }\n'
            '      },\n'
            '      "violation_reason": {\n'
            '        "type": "string",\n'
            '        "description": "Explanation of why the content violates policies."\n'
            '      }\n'
            '    },\n'
            '    "required": [\n'
            '      "violates",\n'
            '      "violation_categories",\n'
            '      "violation_reason"\n'
            '    ],\n'
            '    "additionalProperties": false\n'
            '  },\n'
            '  "strict": true\n'
            "}\n\n"
            "Example 2:\n"
            "{\n"
            '  "name": "math_response",\n'
            '  "strict": true,\n'
            '  "schema": {\n'
            '    "type": "object",\n'
            '    "properties": {\n'
            '      "steps": {\n'
            '        "type": "array",\n'
            '        "items": {\n'
            '          "type": "object",\n'
            '          "properties": {\n'
            '            "explanation": {\n'
            '              "type": "string"\n'
            '            },\n'
            '            "output": {\n'
            '              "type": "string"\n'
            '            }\n'
            '          },\n'
            '          "required": [\n'
            '            "explanation",\n'
            '            "output"\n'
            '          ],\n'
            '          "additionalProperties": false\n'
            '        }\n'
            '      },\n'
            '      "final_answer": {\n'
            '        "type": "string"\n'
            '      }\n'
            '    },\n'
            '    "additionalProperties": false,\n'
            '    "required": [\n'
            '      "steps",\n'
            '      "final_answer"\n'
            '    ]\n'
            '  }\n'
            "}\n\n"
            "Generate the schema definition accordingly."
        )
        self.chatbot.reset(system_instructions=sys_instructions)
        try:
            schema_definition = self.chatbot.get_structured_output(
                prompt=prompt,
                response_format=ResponseFormat
            )
            if schema_definition:
                return schema_definition.model_dump(exclude_none=True)
            else:
                logger.error("Failed to generate response format schema..")
                return None
        except MessageLengthException as e:
            logger.error(f"Error: {e}")
            return "Token limit reached"
        except Exception as e:
            logger.error(f"Error: {e}")