# Convenient Passwords Chrome Extension

A Chrome extension for generating secure passwords completely offline with customizable options.

## Features

- Generate secure passwords using the browser's cryptographically secure random number generator
- Customize password generation with the following options:
  - Include/exclude character classes (uppercase, lowercase, numbers, symbols)
  - Specify character classes for the first and last characters
  - Cluster characters that require the Shift key together in a specific section of the password
  - Select password length (8-64 characters)
  - Generate up to five passwords at a time (default: 3)
- View the entropy of each generated password
- Copy passwords to clipboard with a single click
- Save your preferred settings for future use
- Works completely offline - no network requests are made
- Supports dark mode based on browser/OS settings
- Dynamic popup sizing that adjusts to fit the number of generated passwords
- Optimized compact layout with side-by-side password and copy button to prevent scrolling

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store page for Convenient Passwords
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The extension should now be installed and available in your browser

## Usage

1. Click the Convenient Passwords icon in your browser toolbar
2. Configure your password options:
   - Set the desired password length
   - Choose the number of passwords to generate
   - Select which character classes to include
   - Optionally specify character classes for the first and last characters
   - Optionally enable shift key character clustering and select the position
3. Click "Generate Passwords"
4. View the generated passwords and their entropy values
5. Click "Copy" to copy a password to your clipboard
6. Click "Save Preferences" to store your settings for future use

## Dark Mode

The extension automatically adapts to your browser or operating system's color scheme preference. When your system is set to dark mode, the extension will display with a dark theme for comfortable viewing in low-light environments.

## Security

This extension generates passwords completely offline using the Web Cryptography API's `crypto.getRandomValues()` method, which provides cryptographically secure random values. No data is sent over the network, ensuring your passwords remain private.

## License

MIT License 