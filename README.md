# IOverse

A **Django-powered** web application that utilizes **OpenAI APIs** to deliver latest AI-driven features. Features include conversational AI through Chat Completions, Text-to-Image generation using OpenAI's models, and a fully customizable AI assistant through Assistant API designed for dynamic, intelligent interactions.
---

## Table of Contents

1. [About the Project](#about-the-project)
2. [Features](#features)
3. [Pre-requisites](#pre-requisites)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Usage Guide](#usage-guide)
   - [Chat Completion](#chat-completion)
   - [Text to Image](#text-to-image)
   - [Assistant Domain](#assistant-domain)
7. [Running the Project](#running-the-project)
8. [Contributing](#contributing)
9. [License](#license)

---

## About the Project

This project is a comprehensive AI platform that utilizes OpenAI APIs to offer a customizable user-friendly experience (It's also planned, in the future, the integration of AI services with personal domains). It focuses on following domains:
- **Chat Completion**: A chatbot capable of generating text-based responses using Chat Completions OpenAI APIs.
- **Text-to-Image**: Generate images using **DALL-E** with customizable parameters.
- **Assistant**: A powerful assistant API supporting tool integrations, RAG capabilities, code generation, vector storage,  and real-time interactive threads.

---

## Features

1. **Chat Completion**: Effortless text-based interactions with AI, featuring options to share conversations or export them as PDFs.
2. **Text-to-Image**: Parameter-driven image generation for a highly customizable experience.
3. **Assistant API**:
   - Set parameters like temperature, tools and model.
   - Upload files to create vector stores.
   - Run threads with AI responses streamed via WebSocket, for real-time low-latency responses.
   - Save generations locally.

---

## Pre-requisites

Ensure the following are installed on your system:

1. **Python**: Version 3.10+
2. **Node.js**: Version 18+
3. **npm or yarn**: For managing frontend dependencies.
4. **Virtual Environment**: Recommended for Python dependency management.

---

## Installation

Follow these steps to set up the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/Salva05/ioverse.git
cd ioverse
```

### 2. Set Up the Backend
```bash
cd backend
```
#### Create a Virtual Environment (Optional but Recommended) and activate it
```bash
python -m venv .venv
source .venv/bin/activate # On Windows, use `.venv\Scripts\activate`
```

#### Install dependencies
```bash
pip install -r requirements.txt
```

#### Configure Environment Variables
Set the .env file in the project root and add the required configuration:

1. **Create a `.env` File**

   Move into the project root folder. A template `.env.example` file is provided. Create a `.env` file by copying the template:

    ```bash
    cd ioverse
    cp .env.template .env
    ```

2. **Configure environment variables**

    ```bash
    nano .env
    ```

    ***Environment Variables Overview***

    | Variable              | Description                                                                 | Example / Notes                                                  |
    |-----------------------|-----------------------------------------------------------------------------|------------------------------------------------------------------|
    | `DEBUG`              | Enables or disables the Django debug mode. Should be `false` for development. | `DEBUG=true` |
    | `SECRET_KEY`         | A secret key used for cryptographic signing in Django.                     | Generate one using the command below. Keep it secret!           |
    | `FRONTEND_URL`       | The URL where the frontend application is hosted.                         | `FRONTEND_URL=http://localhost:5173`|
    | `EMAIL_HOST_USER`    | SMTP username or address of the email account used to send emails.         | `EMAIL_HOST_USER=your-email@example.com`                        |
    | `EMAIL_HOST_PASSWORD`| SMTP password or app-specific credential for the above email.  

    > **Notes:**  
    > - To generate a secure `SECRET_KEY`, run the following command in your terminal:  
    >   ```bash
    >   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
    >   ```
    > - `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` are used by Django to send emails, such as password reset links.  
    > - If you’re using *Gmail* and have *Two-Factor* Authentication enabled, you must use an App Password. For other providers (e.g., SendGrid, Mailgun), use the SMTP credentials they supply.

    ### Generate RSA Key Pair
    This application uses the **RS256 signing algorithm** to sign and verify JWT tokens that the backend generates and consumes. Follow these steps to generate the key pair:

    1. **Create a `keys` folder**  
       At the root of your project directory, create a folder named `keys`:
       ```bash
       mkdir keys
       ```

    2. **Generate the Private Key**  
       Use a tool for key generation. This guide will use **OpenSSL** for the purpose. Run the following command to generate the private key (`private.pem`):
       ```bash
       openssl genpkey -algorithm RSA -out keys/private.pem -pkeyopt rsa_keygen_bits:2048
       ```

    3. **Generate the Public Key**  
       Derive the public key (`public.pem`) from the private key:
       ```bash
       openssl rsa -pubout -in keys/private.pem -out keys/public.pem
       ```

    4. **Verify the Keys**  
       To confirm that the keys have been generated correctly:
       ```bash
       openssl rsa -in keys/private.pem -check
       openssl rsa -pubin -in keys/public.pem -text -noout
       ```
