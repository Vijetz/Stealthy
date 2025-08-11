# GEMINI.md - Project free-cluely

## Project Overview

This project is a desktop application named "Free Cluely" designed to "help you cheat on everything." It is built using Electron for the desktop framework, React for the user interface, and TypeScript. It utilizes the Gemini API for its core functionality. The application allows users to take screenshots, process them, and get solutions or information related to the captured content.

**Key Technologies:**

*   **Electron:** For creating the cross-platform desktop application.
*   **React:** For building the user interface.
*   **TypeScript:** For static typing and improved developer experience.
*   **Vite:** As the build tool and development server for the React frontend.
*   **Tailwind CSS:** For styling the application.
*   **Google Gemini API:** For the core AI-powered features.

**Architecture:**

The project is structured into three main parts:

1.  **`electron/`**: Contains the main Electron process source code, responsible for window management, native OS integrations, and background tasks.
2.  **`src/`**: Contains the React-based renderer process source code, which constitutes the user interface of the application.
3.  **`dist-electron/` and `dist/`**: These directories contain the compiled and bundled output of the `electron` and `src` directories, respectively.

## Building and Running

### Prerequisites

*   Node.js
*   Git
*   A Gemini API key

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd free-cluely
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    *   Create a `.env` file in the root directory.
    *   Add your Gemini API key to the `.env` file:
        ```
        GEMINI_API_KEY=your_api_key_here
        ```

### Development Mode

1.  **Start the development server:**
    ```bash
    npm run dev
    ```

2.  **Run the Electron app in development mode:**
    ```bash
    npm run electron:dev
    ```

### Production Build

To create a distributable application, run the following command:

```bash
npm run build
```

The packaged application will be located in the `release/` directory.

## Development Conventions

*   **Linting:** The project uses ESLint for code quality and consistency, with a configuration tailored for TypeScript.
*   **Styling:** Tailwind CSS is used for styling. Utility-first classes are preferred.
*   **Testing:** The project includes a setup for React Testing Library (`App.test.tsx`), but there are no comprehensive tests at the moment.
*   **Contribution:** The `README.md` states that the author is not actively maintaining the repository but is open to pull requests.
