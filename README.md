# IOverse

### A **Django-powered** web application that utilizes **OpenAI APIs** to deliver latest AI-driven features. Features include conversational AI through Chat Completions, Text-to-Image generation using OpenAI's models, and a fully customizable AI assistant through Assistant API designed for dynamic, intelligent interactions.

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
- **Assistant**: A powerful assistant API supporting tool integrations, RAG capabilities, code generation, vector storage, and real-time interactive threads.

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
4. **OpenSSL or similar**: For generating RSA key pairs.
5. **SMTP Credentials**: The email address used for sending emails and its app-specific password for authentication.

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

Set the .env file in the project's backend root and add the required configuration:

1. **Create a `.env` File**

   Move into the project's backend root folder. A template `.env.example` file is provided. Create a `.env` file by copying the template:

   ```bash
   cd ioverse
   cp .env.template .env
   ```

2. **Configure environment variables**

   ```bash
   nano .env
   ```

   **_Environment Variables Overview_**

   | Variable              | Description                                                                   | Example / Notes                                       |
   | --------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
   | `DEBUG`               | Enables or disables the Django debug mode. Should be `false` for development. | `DEBUG=true`                                          |
   | `SECRET_KEY`          | A secret key used for cryptographic signing in Django.                        | Generate one using the command below. Keep it secret! |
   | `FRONTEND_URL`        | The URL where the frontend application is hosted.                             | `FRONTEND_URL=http://localhost:5173`                  |
   | `EMAIL_HOST_USER`     | SMTP username or address of the email account used to send emails.            | `EMAIL_HOST_USER=your-email@example.com`              |
   | `EMAIL_HOST_PASSWORD` | SMTP app-specific password for the above email.                               | `EMAIL_HOST_PASSWORD=your_password`                   |

   > **Notes:**
   >
   > - To generate a `SECRET_KEY`, run the following command in your terminal:
   >   ```bash
   >   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   >   ```
   > - `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` are used by Django to send emails, such as password reset links.
   > - The application uses Gmail as the default email provider. If using a different provider, update the `EMAIL_HOST` variable in the `settings.py` file accordingly.
   > - If you’re using _Gmail_ and have _Two-Factor_ Authentication enabled, you must use an App Password. For other providers (e.g., SendGrid, Mailgun), use the SMTP credentials they supply.

#### Generate RSA Key Pair

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

#### Set Up Database and create the Super User

Run the following commands to set up the database and create a superuser:

1. **Apply Migrations**  
   From the project's backend root folder (at the same level of 'manage.py') run the following command and apply the migrations to initialize the database schema:

   ```bash
   python manage.py migrate
   ```

2. **Create a Superuser**  
   Create a superuser to access the Django admin panel:

   ```bash
   python manage.py createsuperuser
   ```

   Enter the required details when prompted (email can remain empty). This user will have administrative access to manage the application.

### 3. Set Up the Frontend

From the base project directory, navigate into the frontend folder:

```bash
cd frontend
```

#### Install dependencies

Run the following command to install the project dependencies:

```bash
npm install
```

#### Configure Environment Variables

Set the .env file in the project's frontend root and add the required configuration:

1. **Create a `.env` File**

   Again, a template `.env.example` file is provided. Create a `.env` file by copying the template:

   ```bash
   cp .env.template .env
   ```

2. **Configure environment variables**

   ```bash
   nano .env
   ```

   **_Environment Variables Overview_**

   | Variable               | Description                                                       | Example / Notes               |
   | ---------------------- | ----------------------------------------------------------------- | ----------------------------- |
   | `VITE_BASE_DOMAIN_URL` | The base URL for the backend application.                         | `http://localhost:8000`       |
   | `VITE_API_BASE_URL`    | The base URL for API services. Appends `/api` to the backend URL. | `${VITE_BASE_DOMAIN_URL}/api` |
