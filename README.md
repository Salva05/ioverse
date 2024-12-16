# IOverse

A **Django-powered** web application that utilizes **OpenAI APIs** to deliver latest AI-driven features as a conversational AI through Chat Completions, Text-to-Image generation using OpenAI's models, and a fully customizable AI assistant through Assistant API designed for dynamic, intelligent interactions.

## Table of Contents

- [IOverse](#ioverse)
  - [Table of Contents](#table-of-contents)
  - [About the Project](#about-the-project)
  - [Features](#features)
  - [Pre-requisites](#pre-requisites)
  - [OpenAI API Key Requirement](#openai-api-key-requirement)
  - [Installation](#installation)
    - [1. Clone the Repository](#1-clone-the-repository)
    - [2. Set Up the Backend](#2-set-up-the-backend)
      - [Create a Virtual Environment (Optional but Recommended) and activate it](#create-a-virtual-environment-optional-but-recommended-and-activate-it)
      - [Install dependencies](#install-dependencies)
      - [Configure Environment Variables](#configure-environment-variables)
      - [Generate RSA Key Pair](#generate-rsa-key-pair)
      - [Set Up Database and create the Super User](#set-up-database-and-create-the-super-user)
    - [3. Set Up the Frontend](#3-set-up-the-frontend)
      - [Install dependencies](#install-dependencies-1)
      - [Configure Environment Variables](#configure-environment-variables-1)
  - [Running The Project](#running-the-project)
      - [Django Celery Up and Running (Optional but recommended)](#django-celery-up-and-running-optional-but-recommended)
  - [Usage Guide](#usage-guide)
    - [Chat Completion](#chat-completion)
      - [How to Use:](#how-to-use)
    - [Text to Image](#text-to-image)
      - [How to Use:](#how-to-use-1)
    - [Assistant Domain](#assistant-domain)
      - [How to Use:](#how-to-use-2)
  - [Known Issues](#known-issues)
    - [Assistant Domain](#assistant-domain-1)
  - [Project Architecture](#project-architecture)
    - [Backend Tech Stack](#backend-tech-stack)
    - [Frontend Tech Stack](#frontend-tech-stack)
    - [Backend Structure](#backend-structure)
    - [Frontend Structure](#frontend-structure)

## About the Project

This project is a comprehensive AI platform that utilizes OpenAI APIs to offer a customizable user-friendly experience (It's also planned, in the future, the integration of AI services with personal domains). It focuses on following domains:

- **Chat Completion**: A chatbot capable of generating text-based responses using Chat Completions OpenAI APIs.
- **Text-to-Image**: Generate images using **DALL-E** with customizable parameters.
- **Assistant**: A powerful assistant API supporting tool integrations, RAG capabilities, code generation, vector storage, and real-time interactive threads.

## Features

1. **Chat Completion**: Effortless text-based interactions with AI, featuring options to share conversations or export them as PDFs.
2. **Text-to-Image**: Parameter-driven image generation for a highly customizable experience.
3. **Assistant API**:
   - Set parameters like temperature, tools and model.
   - Upload files to create vector stores.
   - Run threads with AI responses streamed via WebSocket, for real-time low-latency responses.
   - Save generations locally.

## Pre-requisites

Ensure the following are installed on your system:

1. **Python**: Version 3.10+
2. **Node.js**: Version 18+
3. **npm or yarn**: For managing frontend dependencies.
4. **OpenSSL or similar**: For generating RSA key pairs.
5. **SMTP Credentials**: The email address used for sending emails and its app-specific password for authentication.

## OpenAI API Key Requirement

To use this application, you must have a valid **OpenAI API key**. This key is essential for interacting with OpenAI’s APIs, as it validates requests made by the application on your behalf.

- **Where to Get an API Key:** You can obtain an API key by creating an account on the [OpenAI website](https://platform.openai.com/signup/). Once logged in, navigate to the API settings section to generate your key.
- **How to Use It in the Application:** During registration, you will be prompted to input your API key. This key will be securely stored in the backend and used for processing your requests.
- **Important Note:** Ensure that your API key has sufficient credits or quota to avoid disruptions while using the application features like Chat Completions or Text-to-Image generation.

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

   > [!NOTE]
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

   > [!IMPORTANT]
   >
   > To grant this user access to the application's functionalities, you must manually register the **OpenAI API key** in the admin panel. Navigate to the "Users" tab, select the admin user you just created, and locate the **API Key** field at the bottom of the user details page. Enter the API key in this field to ensure it is correctly associated with the user for service usage.  
   >
   > Alternatively, you can create a new user from scratch by following the in-app sign-up instructions.


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

## Running The Project

To run the project, you will require:

1. **An Instance of the Backend Server**:  
   Start the Django server by running the following command in the backend directory (same level of manage.py):

   ```bash
   python manage.py runserver
   ```

   > [!NOTE]
   >
   > - Make sure to configure the frontend environment variable for the server URL accordingly.
   > - If a virtual environment was set up during the dependency installation, ensure it is activated before running this command.

2. **An Instance of the Frontend Server**
   Navigate to the frontend directory and start the Vite development server by running:
   ```bash
   npm run dev
   ```

#### Django Celery Up and Running (Optional but recommended)

Lastly, since this project uses Django Celery to perform periodic background operations, such as the check and cleanup of expired shared conversations or images, you should start the Celery worker and scheduler by running the following commands in the backend directory:

```bash
celery -A ioverse worker --pool=solo --loglevel=info
celery -A ioverse beat --loglevel=info
```

> [!NOTE]
>
> Notice the flag `--pool=solo`, is used because Celery is configured as an in-memory worker with a single dedicated thread.

## Usage Guide

First, you will need to sign up and create an account to access the application's pages. During the registration process, you will be required to provide a valid **OpenAI API key**. This key will be stored securely in the local database and used to validate API calls to the OpenAI server for each user's requests.

### Chat Completion

This feature allows users to engage in conversations with the AI, leveraging OpenAI's Chat Completions API.
The default model used is `gpt-4`, which is customizable by manually changing the defualt for the parameter `model` in `backend.ioverse.chatbot_modules.core.chatbot.Chatbot`'s `__init__` method.

#### How to Use:

1. Navigate to the **Chat** page in the application.
2. Type your message in the input field at the bottom of the screen.
3. Press **Enter** or click the **Send** button to submit your query.
4. The AI will respond in real-time, and the conversation will appear in the chat section of the menu.

> [!TIP] 
> You can export your conversations as a PDF or share them directly using the share button. Conversations can also be searched both via the search bar in the menu or in the _Account_ page, and can be managed in the django's admin panel.

---

### Text to Image

This feature uses OpenAI's **DALL-E API** to generate images from text prompts with customizable options.

#### How to Use:

1. Go to the **Text to Image** section of the application.
2. Enter a descriptive text prompt in the input field.
3. Customize parameters such as model, image size, and style.
4. Click **Generate** to create your image.
5. The generated image(s) will appear below the button to generate them, where you can download or share them.

> [!NOTE]
>  You can adjust the number of images and quality for more tailored results. Saved images can be seen and managed in the _Account_ page of the application, and also in the folder `backend/ioverse/media/generated_images` and in the django's admin panel.

---

### Assistant Domain

The Assistant API offers a customizable AI experience for advanced interactions, such as tool integrations, code generation, and real-time threads.

#### How to Use:

1. Open the **Assistant** page in the application.
2. Create an assistant in the _Create_ tab.
3. Configure the assistant in the _Settings_ tab by setting parameters like:
   - Model (e.g., gpt-4o)
   - Temperature (for creativity)
   - Tools (e.g., response format, file upload)
4. Upload files (if needed) to enable vector storage and data retrieval, or other tools.
5. Select the desired assistant from the selection menu in the upper left.
6. Interact with the assistant in the tab _Run_ by sending queries. `Runs` are done on a per-thread basis, where you can initialize the thread with the necessary information before running it. Each thread can be 'cleared' (deleted) and new threads can be created.
7. View responses in real-time, streamed through the WebSocket connection.

> [!TIP]
>  If enabled on the assistant's settings, `file search` and `code interpreter` tools can be triggered explicitly via queries like "Create an image of.." or "Parse this PDF and generate a graph..".

## Known Issues

Below are the currently known issues with the application:

### Assistant Domain

1. **Function Calling Tool:**  
   When the `function call` tool is enabled, and functions are created for an assistant, triggering them via a query results in the application responding with an empty message. This occurs because the OpenAI API generates a response with the status `requires_action`, indicating that the function tool called by the AI needs to be executed with the provided parameters and the result submitted back to the AI. The returned value would then serve as the next AI response.
   - **Current Status:** This functionality is not yet fully implemented and is a work-in-progress feature.

> [!NOTE] 
> We are actively working to resolve these issues in upcoming updates. If you encounter other problems, please report them via the [GitHub Issues page](https://github.com/Salva05/ioverse/issues).

## Project Architecture
The project is built atop the following libraries and frameworks:

### Backend Tech Stack
The backend is implemented using **Django**, following the **Django Rest Framework (DRF)** for building a fully RESTful API. Key backend components include:
- **Django**: The core web framework providing the foundation for the application.
- **Django Rest Framework (DRF)**: For creating and managing RESTful APIs.
- **SimpleJWT**: Token-based authentication for API access.
- **Celery**: Task queue for handling asynchronous operations.
- **Pydantic**: Used for data validation and parsing in external modules.
- **django-environ**: For secure and convenient management of environment variables.
- **Daphne**: ASGI server for handling asynchronous HTTP and WebSocket protocols in Django applications.
- **Channels**: For enabling real-time capabilities, consumer interfaces and WebSocket support in the backend.
- **Tenacity**: A library for retrying operations with customizable backoff and retry strategies, used for error handling in external modules.
- **Bleach**: A library for sanitizing HTML and preventing XSS attacks, ensuring secure handling of user-generated content.
- **OpenAI API (v2 beta) and OpenAI Python SDK**: Integrated with the project to power the assistant, vision and chat features.

### Frontend Tech Stack
The frontend is implemented using **React**, managed with **Vite** for fast development and optimized builds. Key frontend libraries and tools include:
- **React**: The main library for building user interfaces.
- **Material-UI (MUI)**: For pre-designed components and styling, ensuring a consistent and responsive design.
- **React Router**: For client-side navigation and route management.
- **TanStack Query (React Query)**: For server-state management, caching, and data synchronization.
- **Axios**: For making HTTP requests to the backend API.
- **Motion**: A library for creating smooth animations and gestures in React applications.
- **React Toastify**: For displaying non-blocking notifications.
- **Prism.js**: For syntax highlighting in code-related components.
- **date-fns**: A lightweight library for manipulating, formatting, and parsing dates in JavaScript.
- **he**: A library for encoding and decoding HTML entities to ensure proper handling of special characters in text.
- **jwt-decode**: A library for decoding JSON Web Tokens (JWT) to extract payload data without verifying the signature.
- **rehype-sanitize**: A plugin for sanitizing HTML in Markdown, ensuring safe rendering of user-generated content.
- **rehype-raw**: A plugin for parsing and processing raw HTML embedded in Markdown content.
- **react-simple-code-editor**: A lightweight code editor component for React, with syntax highlighting support.
- **Emotion**: For CSS-in-JS styling.

### Backend Structure
The backend is divided into two main domains:

1. **Application-Specific Domains**:  
   - **Chatbot**, **Text-To-Image**, **Assistant**, and **Account**: These represent the core application features. The **Account** domain extends Django's User model to include the user's API key.

2. **External Modules**:  
   - **`chatbot_modules`**, **`text_to_image_modules`**, **`assistant_modules`**, and **`file_modules`**: These modules provide the underlying services used by the application-specific domains. They serve as a bridge between the application and OpenAI APIs.

### Frontend Structure
The frontend structure follows a classic "React-style" approach:

- **api folder**: Contains backend API calls, wrapped with a customized Axios configuration to handle token submission and retry mechanisms (used for JWT authentication).

- **components folder**: Holds all reusable and application-specific React components.

- **contexts folder**: Includes context providers for application-wide functionalities such as theming, authentication, WebSocket management, and domain-specific contexts.

- **hooks folder**: Contains TanStack Query hooks for data fetching and mutations. These serve as the connection point between components and API calls.

- **pages folder**: Houses React Router page components for defining navigable views in the application.

- **services folder**: Contains domain-specific service functions, such as login and token management.

- **styles folder**: Stores application-wide CSS styles.

- **utils folder**: Holds utility functions, such as text formatting and other reusable helpers.
