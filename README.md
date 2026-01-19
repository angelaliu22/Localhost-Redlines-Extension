# Localhost UI Commentor

A developer tool that allows you to add comments and redlines directly to your localhost web applications and send them to an AI agent in VS Code for processing.

## Project Structure

This project consists of two main components:

1.  **Chrome Extension (`chrome-extension-prototype`)**:
    *   Injects an overlay into localhost pages.
    *   Provides tools to inspect the box model (margin, padding, border) and add comments.
    *   Sends feedback to the VS Code extension via a local server.

2.  **VS Code Extension (`localhost-ui-commentor-bridge`)**:
    *   Runs a local HTTP server (port 3001) to receive feedback from the Chrome extension.
    *   Queues incoming comments and sends them to the VS Code Chat Agent for action.

## Prerequisites

*   Node.js & npm
*   Google Chrome
*   Visual Studio Code

## Installation & Setup

### 1. Set up the VS Code Extension (The Backend)

This extension acts as the bridge. You need to run this **inside VS Code**.

1.  **Open the Project**: Open the root folder of this repository (`UI Editor Extension`) in VS Code.
2.  **Open Terminal**: Open the integrated terminal (`Ctrl+` `)`.
3.  **Navigate to Extension Folder**:
    ```bash
    cd vscode/extensions/localhost-ui-commentor-bridge
    ```
    *Current directory should end in `.../localhost-ui-commentor-bridge`*
4.  **Install Dependencies**:
    ```bash
    npm install
    ```
5.  **Run the Server**:
    *   Press `F5` on your keyboard.
    *   Select **"VS Code Extension Development"** if prompted.
    *   A **new VS Code window** will open (this is the "Extension Development Host").
    *   The extension is now running and listening on **port 3001**.

### 2. Set up the Chrome Extension (The Frontend)

1.  **Open Chrome Extensions**:
    *   Type `chrome://extensions` in your address bar.
    *   Toggle **Developer mode** on (top right).
2.  **Load the Extension**:
    *   Click the **Load unpacked** button (top left).
    *   Navigate to where you cloned this repo.
    *   Select the **`chrome-extension-prototype`** folder.
    *   *Do NOT select the root folder, select the inner `chrome-extension-prototype` folder.*
3.  **Verify**: You should see "Localhost UI Commentor" in the list.

## Usage Guide

1.  **Start the Backend**: Ensure the VS Code extension is running (you should see "UI Commentor Bridge Extension v2.0 Activated" in the output channel).
2.  **Open Your App**: Navigate to any localhost URL (e.g., `http://localhost:3000` or `http://127.0.0.1:5500`).
3.  **Inspect**: Move your mouse over elements to see their box model details (margin, border, padding).
4.  **Comment**: Click on an element to open a comment box.
5.  **Send**: Type your feedback and click **"Send to Agent"** (or press Enter).
6.  **Review**:
    *   In the browser, a sidebar will appear showing the status of your comments.
    *   In VS Code, the "UI Commentor Feedback" output channel will log the receipt.
    *   The Agent Chat will open with your feedback pre-populated.

## Troubleshooting

*   **"Failed" status in the browser sidebar**:
    *   Ensure the VS Code extension is running.
    *   Check if `http://localhost:3001/api/status` is accessible in your browser.
    *   Check the VS Code Debug Console for any error messages.

*   **Extension not loading on page**:
    *   Refresh your localhost page.
    *   Ensure your URL matches `localhost` or `127.0.0.1`.
