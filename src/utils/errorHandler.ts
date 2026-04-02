type ErrorType = 'error' | 'warning' | 'info' | 'success';

interface ErrorLog {
  message: string;
  type: ErrorType;
  timestamp: Date;
  stack?: string;
  context?: any;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export function handleApiError(error: any): ApiError {
  if (error.response) {
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      code: error.response.data?.code
    };
  }
  return {
    message: error.message || 'Network error',
    status: 0
  };
}

class ErrorHandler {
  private logs: ErrorLog[] = [];

  handleError(error: any, context?: any): void {
    const errorLog: ErrorLog = {
      message: error?.message || String(error),
      type: 'error',
      timestamp: new Date(),
      stack: error?.stack,
      context
    };

    this.logs.push(errorLog);
    console.error('[ErrorHandler]', errorLog);
    
    // TODO: Send to error logging service (Sentry)
    this.showToast(errorLog.message, 'error');
  }

  handleWarning(message: string, context?: any): void {
    const log: ErrorLog = {
      message,
      type: 'warning',
      timestamp: new Date(),
      context
    };
    
    this.logs.push(log);
    console.warn('[Warning]', log);
    this.showToast(message, 'warning');
  }

  handleSuccess(message: string): void {
    this.showToast(message, 'success');
  }

  handleInfo(message: string): void {
    this.showToast(message, 'info');
  }

  private showToast(message: string, type: ErrorType): void {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    // Set background color based on type
    const colors = {
      error: '#dc3545',
      warning: '#ffc107',
      success: '#28a745',
      info: '#0d6efd'
    };
    toast.style.background = colors[type];

    toast.textContent = message;
    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  getLogs(): ErrorLog[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

export const errorHandler = new ErrorHandler();
