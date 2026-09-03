export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication required', details?: unknown) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', public retryAfter: number, details?: unknown) {
    super(message, 'RATE_LIMITED', 429, details);
    this.name = 'RateLimitError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 'VALIDATION_ERROR', 422, details);
    this.name = 'ValidationError';
  }
}

export class AIError extends AppError {
  constructor(message: string = 'AI service error', details?: unknown) {
    super(message, 'AI_SERVICE_ERROR', 502, details);
    this.name = 'AIError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(message, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied', details?: unknown) {
    super(message, 'FORBIDDEN', 403, details);
    this.name = 'ForbiddenError';
  }
}