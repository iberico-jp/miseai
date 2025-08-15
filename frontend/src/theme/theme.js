import { createTheme } from '@mui/material/styles';

export const miseaiTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4ECDC4',
      light: '#7EDDD6',
      dark: '#3BA99E',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#FF6B6B',
      light: '#FF8A8A',
      dark: '#E55555',
      contrastText: '#FFFFFF'
    },
    success: {
      main: '#00D084',
      light: '#33DA9A',
      dark: '#00A366',
      contrastText: '#FFFFFF'
    },
    warning: {
      main: '#FFB800',
      light: '#FFC933',
      dark: '#CC9300',
      contrastText: '#000000'
    },
    error: {
      main: '#FF5722',
      light: '#FF784E',
      dark: '#E64A19',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#0F1419',
      paper: '#1A1F2E',
      surface: '#252A3A'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B8BCC8',
      disabled: '#6B7280'
    },
    divider: '#374151',
    action: {
      hover: 'rgba(78, 205, 196, 0.08)',
      selected: 'rgba(78, 205, 196, 0.12)',
      disabled: '#6B7280'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em'
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.00938em'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01071em'
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em'
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0F1419',
          backgroundImage: 'radial-gradient(circle at 25% 25%, #1A1F2E 0%, transparent 50%), radial-gradient(circle at 75% 75%, #252A3A 0%, transparent 50%)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1F2E',
          border: '1px solid #374151',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderColor: '#4ECDC4'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(78, 205, 196, 0.3)'
          }
        },
        contained: {
          background: 'linear-gradient(135deg, #4ECDC4 0%, #3BA99E 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #7EDDD6 0%, #4ECDC4 100%)'
          }
        },
        outlined: {
          borderColor: '#4ECDC4',
          color: '#4ECDC4',
          '&:hover': {
            backgroundColor: 'rgba(78, 205, 196, 0.08)',
            borderColor: '#7EDDD6'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1F2E',
          backgroundImage: 'none'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#252A3A',
            '& fieldset': {
              borderColor: '#374151'
            },
            '&:hover fieldset': {
              borderColor: '#4ECDC4'
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4ECDC4'
            }
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1A1F2E',
          border: '1px solid #374151'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1F2E',
          borderBottom: '1px solid #374151'
        }
      }
    }
  }
});
