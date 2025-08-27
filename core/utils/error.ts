export enum AppErrorType {
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  NETWORK = 'network',
  PARSING = 'parsing',
  QUOTA_EXCEEDED = 'quota_exceeded',
  INVALID_REQUEST = 'invalid_request',
  SERVER_ERROR = 'server_error',
  UNKNOWN = 'unknown',
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode?: string;
  public readonly errorMessage?: string;
  public readonly operation: string;
  public readonly errorType: AppErrorType;

  constructor(
    message: string,
    statusCode: number,
    operation: string,
    errorType?: AppErrorType,
    errorCode?: string,
    errorMessage?: string,
  ) {
    super(message);
    this.name = 'RumsanAppError';
    this.statusCode = statusCode;
    this.operation = operation;
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;

    // Set error type based on parameter or auto-detect from status code
    this.errorType = errorType || this.detectErrorType(statusCode);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Auto-detect error type based on HTTP status code
   */
  private detectErrorType(statusCode: number): AppErrorType {
    switch (statusCode) {
      case 401:
        return AppErrorType.AUTHENTICATION;
      case 403:
        return AppErrorType.PERMISSION;
      case 404:
        return AppErrorType.NOT_FOUND;
      case 429:
        return AppErrorType.QUOTA_EXCEEDED;
      case 400:
        return AppErrorType.INVALID_REQUEST;
      case 500:
      case 502:
      case 503:
      case 504:
        return AppErrorType.SERVER_ERROR;
      case 0:
        return AppErrorType.NETWORK;
      default:
        return AppErrorType.UNKNOWN;
    }
  }

  /**
   * Check if this is an authentication error
   */
  get isAuthenticationError(): boolean {
    return this.errorType === AppErrorType.AUTHENTICATION;
  }

  /**
   * Check if this is a permission error
   */
  get isPermissionError(): boolean {
    return this.errorType === AppErrorType.PERMISSION;
  }

  /**
   * Check if this is a not found error
   */
  get isNotFoundError(): boolean {
    return this.errorType === AppErrorType.NOT_FOUND;
  }

  /**
   * Check if this is a quota exceeded error
   */
  get isQuotaExceededError(): boolean {
    return this.errorType === AppErrorType.QUOTA_EXCEEDED;
  }

  /**
   * Check if this is a network error
   */
  get isNetworkError(): boolean {
    return this.errorType === AppErrorType.NETWORK;
  }

  /**
   * Check if this is a server error
   */
  get isServerError(): boolean {
    return this.errorType === AppErrorType.SERVER_ERROR;
  }
}
