// Configuration
const CONFIG = {
    MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
    ALLOWED_EXTENSIONS: ['mp4', 'mov', 'avi', 'webm'],
    ALLOWED_MIME_TYPES: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
};

// Get DOM elements
const uploadForm = document.getElementById('uploadForm');
const videoFileInput = document.getElementById('videoFile');
const fileLabel = document.getElementById('fileLabel');
const customerNameInput = document.getElementById('customerName');
const emailInput = document.getElementById('email');
const whatsappInput = document.getElementById('whatsappNumber');
const moodSelect = document.getElementById('mood');
const submitBtn = document.getElementById('submitBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Error message elements
const errors = {
    file: document.getElementById('fileError'),
    name: document.getElementById('nameError'),
    email: document.getElementById('emailError'),
    phone: document.getElementById('phoneError'),
    mood: document.getElementById('moodError')
};

// Success message elements
const successMessages = {
    file: document.getElementById('fileSuccess')
};

// FILE UPLOAD HANDLER

videoFileInput.addEventListener('change', function() {
    clearError('file');
    successMessages.file.classList.remove('show');
    
    const file = this.files[0];
    
    if (!file) {
        fileLabel.classList.remove('has-file');
        fileLabel.textContent = '📁 Choose video file (MP4, MOV, AVI, WebM)';
        return;
    }

    // Validate file
    const validation = validateFile(file);
    
    if (!validation.isValid) {
        showError('file', validation.error);
        this.value = ''; // Clear the input
        fileLabel.classList.remove('has-file');
        fileLabel.textContent = '📁 Choose video file (MP4, MOV, AVI, WebM)';
        return;
    }

    // File is valid
    fileLabel.classList.add('has-file');
    fileLabel.textContent = `✓ ${file.name} (${formatFileSize(file.size)})`;
    showSuccess('file', 'File accepted!');
});

uploadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear all previous errors
    clearAllErrors();
    
    // Validate all fields
    let isFormValid = true;

    // Validate file
    if (!videoFileInput.files[0]) {
        showError('file', 'Please select a video file');
        isFormValid = false;
    }

    // Validate customer name
    if (!customerNameInput.value.trim()) {
        showError('name', 'Please enter your name');
        isFormValid = false;
    } else if (customerNameInput.value.trim().length < 2) {
        showError('name', 'Name must be at least 2 characters');
        isFormValid = false;
    } else if (!validateName(customerNameInput.value)) {
        showError('name', 'Name cannot contain numbers or special characters');
        isFormValid = false;
    }

    // Validate email
    if (!emailInput.value.trim()) {
        showError('email', 'Please enter your email address');
        isFormValid = false;
    } else if (!validateEmail(emailInput.value)) {
        showError('email', 'Please enter a valid email address');
        isFormValid = false;
    }

    // Validate WhatsApp number
    if (!whatsappInput.value.trim()) {
        showError('phone', 'Please enter your WhatsApp number');
        isFormValid = false;
    } else if (!validatePhoneNumber(whatsappInput.value)) {
        showError('phone', 'Please enter a valid phone number');
        isFormValid = false;
    }

    // Validate mood
    if (!moodSelect.value) {
        showError('mood', 'Please select a mood/genre');
        isFormValid = false;
    }

    // If all validations pass, show loading overlay
    if (isFormValid) {
        showLoadingOverlay();
        
        // Simulate upload process (replace with actual upload logic)
        setTimeout(() => {
            hideLoadingOverlay();
            handleFormSuccess();
        }, 2500); // 2.5 second delay for demo
    }
});

/**
 * Validate file: type, size, extension
 */
function validateFile(file) {
    // Check MIME type
    if (!CONFIG.ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
            isValid: false,
            error: `❌ Wrong file type. Accepted: MP4, MOV, AVI, WebM. Got: ${file.type || 'unknown'}`
        };
    }

    // Check file extension
    const extension = file.name.split('.').pop().toLowerCase();
    if (!CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
        return {
            isValid: false,
            error: `❌ File extension not allowed. Use: .mp4, .mov, .avi, or .webm`
        };
    }

    // Check file size
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: `❌ File too large. Maximum size: ${formatFileSize(CONFIG.MAX_FILE_SIZE)}. Your file: ${formatFileSize(file.size)}`
        };
    }

    return { isValid: true };
}

/**
 * Validate phone number
 * Supports multiple formats:
 * 
 * South Africa:
 * - Local: 0XXXXXXXXX (exactly 10 digits, starts with 0)
 * - International: +27XXXXXXXXX (exactly 9 digits after +27)
 * 
 * Other Countries (with + prefix):
 * - USA: +1 (10 digits after +)
 * - UK: +44 (10 digits after +)
 * - Canada: +1 (10 digits after +)
 * - Australia: +61 (9 digits after +)
 * - Germany: +49 (10-11 digits after +)
 * - France: +33 (9 digits after +)
 * - Spain: +34 (9 digits after +)
 * - India: +91 (10 digits after +)
 * - Brazil: +55 (10-11 digits after +)
 * - Mexico: +52 (10 digits after +)
 * - Nigeria: +234 (10 digits after +)
 * - Kenya: +254 (9 digits after +)
 * - Egypt: +20 (10 digits after +)
 * And many more...
 */
function validatePhoneNumber(phone) {
    const trimmed = phone.trim();
    
    // Rule 1: South African Local Format (0XXXXXXXXX)
    if (trimmed.startsWith('0') && !trimmed.includes('+')) {
        const digitsOnly = trimmed.replace(/\D/g, '');
        // Must be exactly 10 digits starting with 0
        if (digitsOnly.length === 10 && digitsOnly[0] === '0') {
            return true;
        }
        return false;
    }
    
    // Rule 2: International format (starts with +)
    if (trimmed.startsWith('+')) {
        // Extract country code and digits
        const parts = trimmed.match(/^\+(\d+)/);
        if (!parts) return false;
        
        const countryCode = parts[1];
        const digitsOnly = trimmed.replace(/\D/g, '');
        const digitsAfterPlus = digitsOnly.substring(countryCode.length);
        
        // Country-specific validation
        const countryRules = {
            '27': 9,    // South Africa
            '1': 10,    // USA, Canada
            '44': 10,   // UK
            '61': 9,    // Australia
            '49': { min: 10, max: 11 }, // Germany
            '33': 9,    // France
            '34': 9,    // Spain
            '39': 10,   // Italy
            '31': 9,    // Netherlands
            '46': 9,    // Sweden
            '47': 8,    // Norway
            '45': 8,    // Denmark
            '358': 9,   // Finland
            '41': 9,    // Switzerland
            '43': 9,    // Austria
            '32': 9,    // Belgium
            '91': 10,   // India
            '55': { min: 10, max: 11 }, // Brazil
            '52': 10,   // Mexico
            '56': 9,    // Chile
            '57': 10,   // Colombia
            '54': 10,   // Argentina
            '234': 10,  // Nigeria
            '254': 9,   // Kenya
            '256': 9,   // Uganda
            '255': 9,   // Tanzania
            '20': 10,   // Egypt
            '212': 9,   // Morocco
            '216': 8,   // Tunisia
            '213': 9,   // Algeria
            '251': 9,   // Ethiopia
            '86': { min: 10, max: 11 }, // China
            '81': 10,   // Japan
            '82': 10,   // South Korea
            '84': 9,    // Vietnam
            '60': 9,    // Malaysia
            '65': 8,    // Singapore
            '62': 10,   // Indonesia
            '63': 10,   // Philippines
            '66': 9,    // Thailand
        };
        
        // Get the rule for this country code
        const rule = countryRules[countryCode];
        
        if (!rule) {
            // For unknown country codes, accept 8-15 digits (generic validation)
            return digitsAfterPlus.length >= 8 && digitsAfterPlus.length <= 15;
        }
        
        // Validate against the rule
        if (typeof rule === 'number') {
            // Exact digit count required
            return digitsAfterPlus.length === rule;
        } else if (typeof rule === 'object') {
            // Range validation (min and max)
            return digitsAfterPlus.length >= rule.min && digitsAfterPlus.length <= rule.max;
        }
    }
    
    // Invalid format
    return false;
}

/**
 * Validate email: standard email format
 */
function validateEmail(email) {
    const trimmed = email.trim();
    
    // Standard email validation regex
    // Matches: something@domain.extension
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return emailRegex.test(trimmed);
}

/**
 * Validate name: only letters, spaces, and hyphens allowed
 * No numbers, no special characters
 */
function validateName(name) {
    const trimmed = name.trim();
    
    // Allow only letters (a-z, A-Z), spaces, hyphens, and apostrophes
    // This regex allows:
    // - Uppercase and lowercase letters
    // - Spaces (for multi-word names)
    // - Hyphens (for hyphenated names like Mary-Jane)
    // - Apostrophes (for names like O'Brien)
    const validNameRegex = /^[a-zA-Z\s\-']+$/;
    
    return validNameRegex.test(trimmed);
}

/**
 * Show error message for a field
 */
function showError(field, message) {
    const errorElement = errors[field];
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        
        // Add error styling to input
        const input = getInputByField(field);
        if (input) {
            input.parentElement.classList.add('error');
        }
    }
}

/**
 * Clear error message for a field
 */
function clearError(field) {
    const errorElement = errors[field];
    if (errorElement) {
        errorElement.classList.remove('show');
        errorElement.textContent = '';
        
        // Remove error styling from input
        const input = getInputByField(field);
        if (input && input.parentElement) {
            input.parentElement.classList.remove('error');
        }
    }
}

/**
 * Clear all error messages
 */
function clearAllErrors() {
    Object.keys(errors).forEach(field => clearError(field));
}

/**
 * Show success message
 */
function showSuccess(field, message) {
    const successElement = successMessages[field];
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.add('show');
    }
}

/**
 * Get input element by field name
 */
function getInputByField(field) {
    const inputMap = {
        file: videoFileInput,
        name: customerNameInput,
        email: emailInput,
        phone: whatsappInput,
        mood: moodSelect
    };
    return inputMap[field];
}

/**
 * Format file size to human readable format
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Show loading overlay
 */
function showLoadingOverlay() {
    loadingOverlay.classList.add('show');
    submitBtn.disabled = true;
}

/**
 * Hide loading overlay
 */
function hideLoadingOverlay() {
    loadingOverlay.classList.remove('show');
    submitBtn.disabled = false;
}

/**
 * Handle successful form submission
 */
function handleFormSuccess() {
    // Show success message or redirect
    alert(`✓ Form submitted successfully!\n\nName: ${customerNameInput.value}\nEmail: ${emailInput.value}\nPhone: ${whatsappInput.value}\nMood: ${moodSelect.options[moodSelect.selectedIndex].text}\nFile: ${videoFileInput.files[0].name}`);
    
    // Reset form
    uploadForm.reset();
    fileLabel.classList.remove('has-file');
    fileLabel.textContent = '📁 Choose video file (MP4, MOV, AVI, WebM)';
    successMessages.file.classList.remove('show');
}

// Real-time validation for name
customerNameInput.addEventListener('blur', function() {
    if (this.value.trim() && this.value.trim().length < 2) {
        showError('name', 'Name must be at least 2 characters');
    } else if (this.value.trim() && !validateName(this.value)) {
        showError('name', 'Name cannot contain numbers or special characters');
    } else if (this.value.trim()) {
        clearError('name');
    }
});

// Real-time validation for email
emailInput.addEventListener('blur', function() {
    if (this.value.trim() && !validateEmail(this.value)) {
        showError('email', 'Please enter a valid email address');
    } else if (this.value.trim()) {
        clearError('email');
    }
});

// Real-time validation for phone
whatsappInput.addEventListener('blur', function() {
    if (this.value.trim() && !validatePhoneNumber(this.value)) {
        showError('phone', 'Please enter a valid phone number');
    } else if (this.value.trim()) {
        clearError('phone');
    }
});

// Clear error when user starts typing
customerNameInput.addEventListener('input', function() {
    if (this.parentElement.classList.contains('error')) {
        clearError('name');
    }
});

emailInput.addEventListener('input', function() {
    if (this.parentElement.classList.contains('error')) {
        clearError('email');
    }
});

whatsappInput.addEventListener('input', function() {
    if (this.parentElement.classList.contains('error')) {
        clearError('phone');
    }
});

moodSelect.addEventListener('change', function() {
    if (this.parentElement.classList.contains('error')) {
        clearError('mood');
    }
});
