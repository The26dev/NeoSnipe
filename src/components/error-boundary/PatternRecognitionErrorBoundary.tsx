import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
    children: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class PatternRecognitionErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('Pattern Recognition Error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        this.props.onReset?.();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Box 
                    sx={{ 
                        p: 3, 
                        bgcolor: 'error.light',
                        borderRadius: 1,
                        color: 'error.contrastText'
                    }}
                    role="alert"
                >
                    <Typography variant="h6" gutterBottom>
                        Pattern Recognition Error
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {this.state.error?.message || 'An error occurred while analyzing patterns.'}
                    </Typography>
                    {this.state.errorInfo && (
                        <Typography 
                            variant="body2" 
                            component="pre" 
                            sx={{ 
                                mb: 2,
                                maxHeight: '200px',
                                overflow: 'auto',
                                bgcolor: 'rgba(0,0,0,0.1)',
                                p: 1,
                                borderRadius: 1
                            }}
                        >
                            {this.state.errorInfo.componentStack}
                        </Typography>
                    )}
                    <Button 
                        variant="contained" 
                        onClick={this.handleReset}
                        color="primary"
                    >
                        Reset Pattern Recognition
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}