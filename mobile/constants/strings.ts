/**
 * All text content for the M4Hub mobile application
 * Organized by feature/screen for easy localization
 */

export const STRINGS = {
    // App
    APP_NAME: 'M4Hub',
    APP_TAGLINE: 'Music, Messages, Money, Morning Updates',

    // Common
    COMMON: {
        CONTINUE: 'Continue',
        CANCEL: 'Cancel',
        SAVE: 'Save',
        DELETE: 'Delete',
        EDIT: 'Edit',
        DONE: 'Done',
        BACK: 'Back',
        NEXT: 'Next',
        SKIP: 'Skip',
        LOADING: 'Loading...',
        ERROR: 'Error',
        SUCCESS: 'Success',
        RETRY: 'Retry',
        OK: 'OK',
        YES: 'Yes',
        NO: 'No',
    },

    // Welcome Screen
    WELCOME: {
        TITLE: 'Welcome to M4Hub',
        SUBTITLE: 'Your all-in-one platform for music, messaging, money, and news',
        LOGIN_PHONE: 'Login with Phone Number',
        LOGIN_EMAIL: 'Login with Email',
        FOOTER: 'By continuing, you agree to our Terms & Privacy Policy',
    },

    // Phone Login
    PHONE_LOGIN: {
        TITLE: 'Phone Login',
        SUBTITLE: 'Enter your phone number to continue',
        PHONE_LABEL: 'Phone Number',
        PHONE_PLACEHOLDER: 'Enter your phone number',
        COUNTRY_CODE: '+91',
        SEND_OTP: 'Send OTP',
        INVALID_PHONE: 'Please enter a valid 10-digit phone number',
        SENDING: 'Sending OTP...',
    },

    // OTP Verification
    OTP: {
        TITLE: 'Verify OTP',
        SUBTITLE: 'Enter the 6-digit code sent to',
        OTP_LABEL: 'Verification Code',
        VERIFY: 'Verify',
        RESEND: 'Resend OTP',
        RESEND_IN: 'Resend in',
        SECONDS: 'seconds',
        INVALID_OTP: 'Invalid OTP. Please try again.',
        EXPIRED_OTP: 'OTP has expired. Please request a new one.',
        VERIFYING: 'Verifying...',
        DIDNT_RECEIVE: "Didn't receive the code?",
    },

    // Email Login
    EMAIL_LOGIN: {
        TITLE: 'Email Login',
        SUBTITLE: 'Enter your email and password',
        EMAIL_LABEL: 'Email Address',
        EMAIL_PLACEHOLDER: 'Enter your email',
        PASSWORD_LABEL: 'Password',
        PASSWORD_PLACEHOLDER: 'Enter your password',
        LOGIN: 'Login',
        FORGOT_PASSWORD: 'Forgot Password?',
        INVALID_EMAIL: 'Please enter a valid email address',
        INVALID_PASSWORD: 'Password must be at least 8 characters',
    },

    // Profile Setup
    PROFILE: {
        TITLE: 'Complete Your Profile',
        SUBTITLE: 'Please provide the following information',
        FIRST_NAME_LABEL: 'First Name',
        FIRST_NAME_PLACEHOLDER: 'Enter your first name',
        LAST_NAME_LABEL: 'Last Name',
        LAST_NAME_PLACEHOLDER: 'Enter your last name',
        DOB_LABEL: 'Date of Birth',
        DOB_PLACEHOLDER: 'Select your date of birth',
        GENDER_LABEL: 'Gender',
        GENDER_PLACEHOLDER: 'Select your gender',
        GENDER_MALE: 'Male',
        GENDER_FEMALE: 'Female',
        GENDER_OTHER: 'Other',
        EMAIL_LABEL: 'Email Address',
        EMAIL_PLACEHOLDER: 'Enter your email',
        VERIFY_EMAIL: 'Verify Email',
        EMAIL_VERIFIED: 'Email Verified',
        SAVE_PROFILE: 'Save Profile',
        SAVING: 'Saving...',
        REQUIRED_FIELD: 'This field is required',
    },

    // Dashboard
    DASHBOARD: {
        TITLE: 'Dashboard',
        WELCOME: 'Welcome back',
        MUSIC: 'Music',
        MUSIC_DESC: 'Stream your favorite songs',
        MESSAGE: 'Messages',
        MESSAGE_DESC: 'Chat with friends',
        MONEY: 'Money Transfer',
        MONEY_DESC: 'Send and receive money',
        NEWS: 'Morning Update',
        NEWS_DESC: 'Stay updated with news',
    },

    // Music Feature
    MUSIC: {
        TITLE: 'Music',
        SEARCH: 'Search songs, artists, albums...',
        PLAYLISTS: 'Playlists',
        RECENTLY_PLAYED: 'Recently Played',
        FAVORITES: 'Favorites',
        NOW_PLAYING: 'Now Playing',
        PLAY: 'Play',
        PAUSE: 'Pause',
        NEXT: 'Next',
        PREVIOUS: 'Previous',
        SHUFFLE: 'Shuffle',
        REPEAT: 'Repeat',
    },

    // Message Feature
    MESSAGE: {
        TITLE: 'Messages',
        SEARCH: 'Search contacts...',
        NEW_MESSAGE: 'New Message',
        TYPE_MESSAGE: 'Type a message...',
        SEND: 'Send',
        ONLINE: 'Online',
        OFFLINE: 'Offline',
        TYPING: 'typing...',
    },

    // Money Transfer
    MONEY: {
        TITLE: 'Money Transfer',
        BALANCE: 'Balance',
        SEND_MONEY: 'Send Money',
        REQUEST_MONEY: 'Request Money',
        TRANSACTION_HISTORY: 'Transaction History',
        ENTER_AMOUNT: 'Enter Amount',
        SELECT_RECIPIENT: 'Select Recipient',
        TRANSFER: 'Transfer',
        CONFIRM_TRANSFER: 'Confirm Transfer',
    },

    // News/Morning Update
    NEWS: {
        TITLE: 'Morning Update',
        LATEST_NEWS: 'Latest News',
        CATEGORIES: 'Categories',
        BOOKMARKS: 'Bookmarks',
        READ_MORE: 'Read More',
        SHARE: 'Share',
        BOOKMARK: 'Bookmark',
    },

    // Errors
    ERRORS: {
        GENERIC: 'Something went wrong. Please try again.',
        NETWORK: 'Network error. Check your internet connection.',
        TIMEOUT: 'Request timeout. Please try again.',
        SERVER: 'Server error. Please try again later.',
        UNAUTHORIZED: 'Session expired. Please login again.',
        NOT_FOUND: 'Resource not found.',
        VALIDATION: 'Please check your input and try again.',
    },

    // Success Messages
    SUCCESS: {
        LOGIN: 'Login successful!',
        PROFILE_SAVED: 'Profile saved successfully!',
        EMAIL_VERIFIED: 'Email verified successfully!',
        OTP_SENT: 'OTP sent successfully!',
        LOGOUT: 'Logged out successfully!',
    },
} as const;
