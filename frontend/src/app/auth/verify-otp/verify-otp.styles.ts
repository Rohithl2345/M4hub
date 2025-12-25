/**
 * Styles for OTP Verification Page
 * Moved from inline MUI sx props for better maintainability
 */

export const verifyOtpStyles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #5433ff 0%, #20bdff 100%)',
        py: 4,
    },
    centerBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
    },
    card: {
        maxWidth: '400px',
        width: '100%',
        p: 4,
        bgcolor: 'white',
        borderRadius: 3,
        border: '2px solid black',
    },
    header: {
        textAlign: 'center',
        mb: 4,
    },
    lockIcon: {
        fontSize: 48,
        mb: 2,
        color: '#FF6B35',
    },
    phoneNumber: {
        mt: 1,
    },
    otpContainer: {
        display: 'flex',
        gap: 1.5,
        mb: 3,
        justifyContent: 'center',
    },
    otpInput: {
        width: '56px',
        '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: 'white',
            '& fieldset': {
                borderColor: '#ccc',
                borderWidth: 2,
            },
            '&:hover fieldset': {
                borderColor: 'black',
                borderWidth: 2,
            },
            '&.Mui-focused fieldset': {
                borderColor: 'black',
                borderWidth: 2,
            },
        },
    },
    otpInputFilled: {
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'black',
            },
        },
    },
    otpInputProps: {
        maxLength: 1,
        style: {
            textAlign: 'center' as const,
            fontSize: '24px',
            fontWeight: 'bold',
        },
    },
    errorAlert: {
        mb: 2,
        borderRadius: 2,
    },
    verifyButton: {
        py: 1.5,
        bgcolor: 'black',
        color: 'white',
        borderRadius: 2,
        fontSize: '16px',
        fontWeight: 'bold',
        '&:hover': {
            bgcolor: '#333',
        },
        '&:disabled': {
            bgcolor: '#ccc',
            color: '#666',
        },
    },
    resendContainer: {
        textAlign: 'center',
        mt: 3,
    },
    resendLink: {
        color: '#FF6B35',
        fontWeight: 'bold',
        textDecoration: 'none',
        '&:hover': {
            textDecoration: 'underline',
        },
        cursor: 'pointer',
    },
} as const;
