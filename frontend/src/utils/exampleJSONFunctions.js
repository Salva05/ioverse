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
}`
};
