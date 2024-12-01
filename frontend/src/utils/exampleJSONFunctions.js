// Example JSON Functions for Function Tool of Assistant
export const exampleJSONs = {
  get_weather: `{
  "name": "get_weather",
  "description": "Determine weather in my location",
  "strict": true,
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "The city and state e.g. San Francisco, CA"
      },
      "unit": {
        "type": "string",
        "enum": [
          "c",
          "f"
        ]
      }
    },
    "additionalProperties": false,
    "required": [
      "location",
      "unit"
    ]
  }
}`,
  get_stock_price: `{
  "name": "get_stock_price",
  "description": "Get the current stock price",
  "strict": true,
  "parameters": {
    "type": "object",
    "properties": {
      "symbol": {
        "type": "string",
        "description": "The stock symbol"
      }
    },
    "additionalProperties": false,
    "required": ["symbol"]
  }
}`,
  get_traffic: `{
  "name": "get_traffic",
  "description": "Gives current traffic conditions for a given area.",
  "parameters": {
    "type": "object",
    "properties": {
      "location": {
        "type": "object",
        "properties": {
          "city": {
            "type": "string",
            "description": "Name of the city"
          },
          "state": {
            "type": "string",
            "description": "Two-letter state abbreviation"
          }
        },
        "required": [
          "city",
          "state"
        ]
      }
    },
    "required": [
      "location"
    ]
  }
}`,
placeholder_function: `{
  "name": "get_stock_price",
  "description": "Get the current stock price",
  "strict": true,
  "parameters": {
    "type": "object",
    "properties": {
      "symbol": {
        "type": "string",
        "description": "The stock symbol"
      }
    },
    "additionalProperties": false,
    "required": ["symbol"]
  }
}`,
// These represents the set of json_schema response formats availables as examples
placeholder_schema:`{
  "name": "math_response",
  "strict": true,
  "schema": {
    "type": "object",
    "properties": {
      "steps": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "explanation": {
              "type": "string"
            },
            "output": {
              "type": "string"
            }
          },
          "required": [
            "explanation",
            "output"
          ],
          "additionalProperties": false
        }
      },
      "final_answer": {
        "type": "string"
      }
    },
    "additionalProperties": false,
    "required": [
      "steps",
      "final_answer"
    ]
  }
}`,
math_response: `{
  "name": "math_response",
  "strict": true,
  "schema": {
    "type": "object",
    "properties": {
      "steps": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "explanation": {
              "type": "string"
            },
            "output": {
              "type": "string"
            }
          },
          "required": [
            "explanation",
            "output"
          ],
          "additionalProperties": false
        }
      },
      "final_answer": {
        "type": "string"
      }
    },
    "additionalProperties": false,
    "required": [
      "steps",
      "final_answer"
    ]
  }
}`,
paper_metadata: `{
  "name": "paper_metadata",
  "schema": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string"
      },
      "authors": {
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "abstract": {
        "type": "string"
      },
      "keywords": {
        "type": "array",
        "items": {
          "type": "string"
        }
      }
    },
    "required": [
      "title",
      "authors",
      "abstract",
      "keywords"
    ],
    "additionalProperties": false
  },
  "strict": true
}`,
content_compliance: `{
  "name": "content_compliance",
  "schema": {
    "type": "object",
    "properties": {
      "violates": {
        "type": "boolean",
        "description": "Indicates whether the content violates policies."
      },
      "violation_categories": {
        "type": "array",
        "description": "Categories under which the content violates policies.",
        "items": {
          "type": "string",
          "enum": [
            "sexual",
            "violence",
            "self_harm"
          ]
        }
      },
      "violation_reason": {
        "type": "string",
        "description": "Explanation of why the content violates policies."
      }
    },
    "required": [
      "violates",
      "violation_categories",
      "violation_reason"
    ],
    "additionalProperties": false
  },
  "strict": true
}`,
};
