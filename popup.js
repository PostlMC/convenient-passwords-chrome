document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const generateBtn = document.getElementById('generateBtn');
    const savePreferencesBtn = document.getElementById('savePreferencesBtn');
    const passwordLengthInput = document.getElementById('passwordLength');
    const passwordCountInput = document.getElementById('passwordCount');
    const includeLowercaseCheckbox = document.getElementById('includeLowercase');
    const includeUppercaseCheckbox = document.getElementById('includeUppercase');
    const includeNumbersCheckbox = document.getElementById('includeNumbers');
    const includeSymbolsCheckbox = document.getElementById('includeSymbols');
    const firstCharClassSelect = document.getElementById('firstCharClass');
    const lastCharClassSelect = document.getElementById('lastCharClass');
    const enableClusteringCheckbox = document.getElementById('enableClustering');
    const clusteringPositionSelect = document.getElementById('clusteringPosition');
    const resultsSection = document.getElementById('resultsSection');
    const entropyDisplay = document.getElementById('entropyDisplay');

    // Dark mode detection
    function setupThemeDetection() {
        // Check if the user prefers dark mode
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Apply the appropriate class to the body
        document.body.classList.toggle('dark-theme', prefersDarkMode);

        // Listen for changes in the color scheme preference
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            document.body.classList.toggle('dark-theme', e.matches);
        });
    }

    // Initialize theme detection
    setupThemeDetection();

    // Load saved preferences
    loadPreferences();

    // Initial resize of the popup
    setTimeout(resizePopup, 100);

    // Character sets
    const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
    const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const NUMBER_CHARS = '0123456789';
    const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // Characters that require the Shift key (uppercase and symbols)
    const SHIFT_CHARS = UPPERCASE_CHARS + SYMBOL_CHARS;
    const NON_SHIFT_CHARS = LOWERCASE_CHARS + NUMBER_CHARS;

    // Event listeners for real-time entropy updates
    passwordLengthInput.addEventListener('input', updateEntropyDisplay);
    includeLowercaseCheckbox.addEventListener('change', updateEntropyDisplay);
    includeUppercaseCheckbox.addEventListener('change', updateEntropyDisplay);
    includeNumbersCheckbox.addEventListener('change', updateEntropyDisplay);
    includeSymbolsCheckbox.addEventListener('change', updateEntropyDisplay);

    // Event listener for password count to adjust container height
    passwordCountInput.addEventListener('change', function () {
        // Don't resize immediately when count changes, only store the value
        // The actual resize will happen when passwords are generated
    });

    // Event listener for clustering option
    enableClusteringCheckbox.addEventListener('change', function () {
        clusteringPositionSelect.disabled = !this.checked;
    });

    // Generate button event listener
    generateBtn.addEventListener('click', generatePasswords);

    // Save preferences button event listener
    savePreferencesBtn.addEventListener('click', savePreferences);

    // Update entropy display initially
    updateEntropyDisplay();

    // Function to save user preferences
    function savePreferences() {
        const preferences = {
            passwordLength: passwordLengthInput.value,
            passwordCount: passwordCountInput.value,
            includeLowercase: includeLowercaseCheckbox.checked,
            includeUppercase: includeUppercaseCheckbox.checked,
            includeNumbers: includeNumbersCheckbox.checked,
            includeSymbols: includeSymbolsCheckbox.checked,
            firstCharClass: firstCharClassSelect.value,
            lastCharClass: lastCharClassSelect.value,
            enableClustering: enableClusteringCheckbox.checked,
            clusteringPosition: clusteringPositionSelect.value
        };

        chrome.storage.sync.set({ preferences }, function () {
            // Show a temporary success message
            const originalText = savePreferencesBtn.textContent;
            savePreferencesBtn.textContent = 'Preferences Saved!';
            setTimeout(function () {
                savePreferencesBtn.textContent = originalText;
            }, 1500);
        });
    }

    // Function to load user preferences
    function loadPreferences() {
        chrome.storage.sync.get('preferences', function (data) {
            if (data.preferences) {
                const prefs = data.preferences;

                // Apply saved preferences to form elements
                passwordLengthInput.value = prefs.passwordLength || 16;
                passwordCountInput.value = prefs.passwordCount || 3;
                includeLowercaseCheckbox.checked = prefs.includeLowercase !== undefined ? prefs.includeLowercase : true;
                includeUppercaseCheckbox.checked = prefs.includeUppercase !== undefined ? prefs.includeUppercase : true;
                includeNumbersCheckbox.checked = prefs.includeNumbers !== undefined ? prefs.includeNumbers : true;
                includeSymbolsCheckbox.checked = prefs.includeSymbols !== undefined ? prefs.includeSymbols : true;
                firstCharClassSelect.value = prefs.firstCharClass || 'any';
                lastCharClassSelect.value = prefs.lastCharClass || 'any';
                enableClusteringCheckbox.checked = prefs.enableClustering || false;
                clusteringPositionSelect.value = prefs.clusteringPosition || 'middle';

                // Update dependent UI elements
                clusteringPositionSelect.disabled = !enableClusteringCheckbox.checked;

                // Update entropy display based on loaded preferences
                updateEntropyDisplay();
            }
        });
    }

    // Function to update entropy display in real-time
    function updateEntropyDisplay() {
        // Get current settings
        const passwordLength = parseInt(passwordLengthInput.value) || 0;
        const includeLowercase = includeLowercaseCheckbox.checked;
        const includeUppercase = includeUppercaseCheckbox.checked;
        const includeNumbers = includeNumbersCheckbox.checked;
        const includeSymbols = includeSymbolsCheckbox.checked;

        // Check if at least one character class is selected
        if (passwordLength < 1 || (!includeLowercase && !includeUppercase && !includeNumbers && !includeSymbols)) {
            entropyDisplay.textContent = 'Entropy: 0 bits';
            return;
        }

        // Calculate and display entropy
        const entropy = calculateEntropy(
            passwordLength,
            includeLowercase,
            includeUppercase,
            includeNumbers,
            includeSymbols
        );

        entropyDisplay.textContent = `Password Entropy: ${entropy} bits`;
    }

    // Function to resize the popup based on content
    function resizePopup() {
        // Get the number of passwords
        const passwordCount = parseInt(passwordCountInput.value) || 3;

        // Adjust the container's max-height based on the number of passwords
        const container = document.querySelector('.container');
        if (container) {
            // Base height for the UI without passwords
            const baseHeight = 350;
            // Height per password (including margins)
            const heightPerPassword = 55;
            // Calculate total height needed
            let totalHeight = baseHeight + (passwordCount * heightPerPassword);

            // Add extra space for 4 or 5 passwords
            if (passwordCount >= 4) {
                totalHeight += 50;
            }
            if (passwordCount >= 5) {
                totalHeight += 60;
            }

            // Set the container height
            container.style.minHeight = `${totalHeight}px`;
        }
    }

    // Main password generation function
    function generatePasswords() {
        // Clear previous results
        resultsSection.innerHTML = '';

        // Get user options
        const passwordLength = parseInt(passwordLengthInput.value);
        const passwordCount = parseInt(passwordCountInput.value);

        // Validate inputs
        if (passwordLength < 8) {
            showError('Password length must be at least 8 characters');
            return;
        }

        if (passwordCount < 1 || passwordCount > 5) {
            showError('Number of passwords must be between 1 and 5');
            return;
        }

        // Check if at least one character class is selected
        if (!includeLowercaseCheckbox.checked &&
            !includeUppercaseCheckbox.checked &&
            !includeNumbersCheckbox.checked &&
            !includeSymbolsCheckbox.checked) {
            showError('At least one character class must be selected');
            return;
        }

        // Generate the requested number of passwords
        for (let i = 0; i < passwordCount; i++) {
            const password = generatePassword(
                passwordLength,
                includeLowercaseCheckbox.checked,
                includeUppercaseCheckbox.checked,
                includeNumbersCheckbox.checked,
                includeSymbolsCheckbox.checked,
                firstCharClassSelect.value,
                lastCharClassSelect.value,
                enableClusteringCheckbox.checked,
                clusteringPositionSelect.value
            );

            displayPassword(password);
        }

        // Resize the popup after passwords are generated
        setTimeout(resizePopup, 0);
    }

    // Generate a single password based on user options
    function generatePassword(
        length,
        includeLowercase,
        includeUppercase,
        includeNumbers,
        includeSymbols,
        firstCharClass,
        lastCharClass,
        enableClustering,
        clusteringPosition
    ) {
        // Build character pool based on selected options
        let charPool = '';
        if (includeLowercase) charPool += LOWERCASE_CHARS;
        if (includeUppercase) charPool += UPPERCASE_CHARS;
        if (includeNumbers) charPool += NUMBER_CHARS;
        if (includeSymbols) charPool += SYMBOL_CHARS;

        // Handle special case for clustering shift characters
        if (enableClustering) {
            return generateClusteredPassword(
                length,
                includeLowercase,
                includeUppercase,
                includeNumbers,
                includeSymbols,
                firstCharClass,
                lastCharClass,
                clusteringPosition
            );
        }

        // Generate a random password
        let password = '';

        // Generate the middle part of the password (excluding first and last chars)
        const middleLength = length - 2;
        for (let i = 0; i < middleLength; i++) {
            password += getRandomChar(charPool);
        }

        // Handle first character based on selected class
        const firstChar = getCharFromClass(firstCharClass, includeLowercase, includeUppercase, includeNumbers, includeSymbols);

        // Handle last character based on selected class
        const lastChar = getCharFromClass(lastCharClass, includeLowercase, includeUppercase, includeNumbers, includeSymbols);

        // Combine all parts
        password = firstChar + password + lastChar;

        // Ensure all required character classes are included
        password = ensureAllRequiredClasses(
            password,
            includeLowercase,
            includeUppercase,
            includeNumbers,
            includeSymbols
        );

        return password;
    }

    // Generate a password with clustered shift characters
    function generateClusteredPassword(
        length,
        includeLowercase,
        includeUppercase,
        includeNumbers,
        includeSymbols,
        firstCharClass,
        lastCharClass,
        clusteringPosition
    ) {
        // Determine which characters require shift and which don't
        let shiftChars = '';
        let nonShiftChars = '';

        if (includeUppercase) shiftChars += UPPERCASE_CHARS;
        if (includeSymbols) shiftChars += SYMBOL_CHARS;
        if (includeLowercase) nonShiftChars += LOWERCASE_CHARS;
        if (includeNumbers) nonShiftChars += NUMBER_CHARS;

        // If no shift characters are selected, fall back to regular generation
        if (shiftChars.length === 0) {
            return generatePassword(
                length,
                includeLowercase,
                includeUppercase,
                includeNumbers,
                includeSymbols,
                firstCharClass,
                lastCharClass,
                false,
                ''
            );
        }

        // If no non-shift characters are selected, fall back to regular generation
        if (nonShiftChars.length === 0) {
            return generatePassword(
                length,
                includeLowercase,
                includeUppercase,
                includeNumbers,
                includeSymbols,
                firstCharClass,
                lastCharClass,
                false,
                ''
            );
        }

        // Determine the length of the shift section (at least 1/4 of the password)
        const shiftSectionLength = Math.max(Math.floor(length / 4), 1);
        const nonShiftSectionLength = length - shiftSectionLength;

        // Generate shift and non-shift sections
        let shiftSection = '';
        for (let i = 0; i < shiftSectionLength; i++) {
            shiftSection += getRandomChar(shiftChars);
        }

        let nonShiftSection = '';
        for (let i = 0; i < nonShiftSectionLength; i++) {
            nonShiftSection += getRandomChar(nonShiftChars);
        }

        // Combine sections based on clustering position
        let password = '';
        switch (clusteringPosition) {
            case 'start':
                password = shiftSection + nonShiftSection;
                break;
            case 'middle':
                const halfNonShift = Math.floor(nonShiftSectionLength / 2);
                password = nonShiftSection.substring(0, halfNonShift) +
                    shiftSection +
                    nonShiftSection.substring(halfNonShift);
                break;
            case 'end':
                password = nonShiftSection + shiftSection;
                break;
            default:
                password = nonShiftSection + shiftSection;
        }

        // Handle first and last characters
        if (firstCharClass !== 'any') {
            const firstChar = getCharFromClass(firstCharClass, includeLowercase, includeUppercase, includeNumbers, includeSymbols);
            password = firstChar + password.substring(1);
        }

        if (lastCharClass !== 'any') {
            const lastChar = getCharFromClass(lastCharClass, includeLowercase, includeUppercase, includeNumbers, includeSymbols);
            password = password.substring(0, password.length - 1) + lastChar;
        }

        return password;
    }

    // Get a character from a specific character class
    function getCharFromClass(charClass, includeLowercase, includeUppercase, includeNumbers, includeSymbols) {
        switch (charClass) {
            case 'lowercase':
                return includeLowercase ? getRandomChar(LOWERCASE_CHARS) : getRandomChar(buildCharPool(includeLowercase, includeUppercase, includeNumbers, includeSymbols));
            case 'uppercase':
                return includeUppercase ? getRandomChar(UPPERCASE_CHARS) : getRandomChar(buildCharPool(includeLowercase, includeUppercase, includeNumbers, includeSymbols));
            case 'number':
                return includeNumbers ? getRandomChar(NUMBER_CHARS) : getRandomChar(buildCharPool(includeLowercase, includeUppercase, includeNumbers, includeSymbols));
            case 'symbol':
                return includeSymbols ? getRandomChar(SYMBOL_CHARS) : getRandomChar(buildCharPool(includeLowercase, includeUppercase, includeNumbers, includeSymbols));
            case 'letter':
                let letterPool = '';
                if (includeLowercase) letterPool += LOWERCASE_CHARS;
                if (includeUppercase) letterPool += UPPERCASE_CHARS;
                return letterPool.length > 0 ? getRandomChar(letterPool) : getRandomChar(buildCharPool(includeLowercase, includeUppercase, includeNumbers, includeSymbols));
            case 'alphanumeric':
                let alphanumericPool = '';
                if (includeLowercase) alphanumericPool += LOWERCASE_CHARS;
                if (includeUppercase) alphanumericPool += UPPERCASE_CHARS;
                if (includeNumbers) alphanumericPool += NUMBER_CHARS;
                return alphanumericPool.length > 0 ? getRandomChar(alphanumericPool) : getRandomChar(buildCharPool(includeLowercase, includeUppercase, includeNumbers, includeSymbols));
            case 'any':
            default:
                return getRandomChar(buildCharPool(includeLowercase, includeUppercase, includeNumbers, includeSymbols));
        }
    }

    // Build a character pool based on selected options
    function buildCharPool(includeLowercase, includeUppercase, includeNumbers, includeSymbols) {
        let pool = '';
        if (includeLowercase) pool += LOWERCASE_CHARS;
        if (includeUppercase) pool += UPPERCASE_CHARS;
        if (includeNumbers) pool += NUMBER_CHARS;
        if (includeSymbols) pool += SYMBOL_CHARS;
        return pool;
    }

    // Ensure the password contains at least one character from each selected class
    function ensureAllRequiredClasses(password, includeLowercase, includeUppercase, includeNumbers, includeSymbols) {
        let modifiedPassword = password;

        // Check if all required character classes are included
        const hasLowercase = /[a-z]/.test(modifiedPassword);
        const hasUppercase = /[A-Z]/.test(modifiedPassword);
        const hasNumber = /[0-9]/.test(modifiedPassword);
        const hasSymbol = new RegExp('[' + escapeRegExp(SYMBOL_CHARS) + ']').test(modifiedPassword);

        // Replace random characters if needed
        let positions = getRandomPositions(modifiedPassword.length);
        let posIndex = 0;

        if (includeLowercase && !hasLowercase) {
            modifiedPassword = replaceCharAt(modifiedPassword, positions[posIndex++], getRandomChar(LOWERCASE_CHARS));
        }

        if (includeUppercase && !hasUppercase) {
            modifiedPassword = replaceCharAt(modifiedPassword, positions[posIndex++], getRandomChar(UPPERCASE_CHARS));
        }

        if (includeNumbers && !hasNumber) {
            modifiedPassword = replaceCharAt(modifiedPassword, positions[posIndex++], getRandomChar(NUMBER_CHARS));
        }

        if (includeSymbols && !hasSymbol) {
            modifiedPassword = replaceCharAt(modifiedPassword, positions[posIndex++], getRandomChar(SYMBOL_CHARS));
        }

        return modifiedPassword;
    }

    // Helper function to escape special characters in regex
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Replace a character at a specific position
    function replaceCharAt(str, index, character) {
        return str.substring(0, index) + character + str.substring(index + 1);
    }

    // Get an array of random positions (for character replacement)
    function getRandomPositions(length) {
        let positions = Array.from({ length: length }, (_, i) => i);

        // Fisher-Yates shuffle
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(getSecureRandom() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        return positions;
    }

    // Get a random character from a pool
    function getRandomChar(charPool) {
        if (!charPool.length) return '';
        const randomIndex = Math.floor(getSecureRandom() * charPool.length);
        return charPool.charAt(randomIndex);
    }

    // Use the most secure random number generation available in the browser
    function getSecureRandom() {
        // Use crypto.getRandomValues for secure random number generation
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] / (0xffffffff + 1); // Convert to a number between 0 and 1
    }

    // Calculate password entropy (in bits)
    function calculateEntropy(length, includeLowercase, includeUppercase, includeNumbers, includeSymbols) {
        let poolSize = 0;
        if (includeLowercase) poolSize += LOWERCASE_CHARS.length;
        if (includeUppercase) poolSize += UPPERCASE_CHARS.length;
        if (includeNumbers) poolSize += NUMBER_CHARS.length;
        if (includeSymbols) poolSize += SYMBOL_CHARS.length;

        // Entropy formula: log2(poolSize^length) = length * log2(poolSize)
        const entropy = length * (Math.log(poolSize) / Math.log(2));
        return entropy.toFixed(2);
    }

    // Display a password in the results section
    function displayPassword(password) {
        const passwordResult = document.createElement('div');
        passwordResult.className = 'password-result';

        const passwordText = document.createElement('div');
        passwordText.className = 'password-text';
        passwordText.textContent = password;

        const passwordInfo = document.createElement('div');
        passwordInfo.className = 'password-info';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', function () {
            navigator.clipboard.writeText(password).then(function () {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(function () {
                    copyBtn.textContent = originalText;
                }, 1500);
            });
        });

        passwordResult.appendChild(passwordText);
        passwordInfo.appendChild(copyBtn);
        passwordResult.appendChild(passwordInfo);

        resultsSection.appendChild(passwordResult);
    }

    // Show an error message
    function showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;

        resultsSection.innerHTML = '';
        resultsSection.appendChild(errorElement);
    }
}); 