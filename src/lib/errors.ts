/** Base error class for application errors. */
export class AppError extends Error {
	readonly code: string;

	constructor(message: string, code: string) {
		super(message);
		this.name = 'AppError';
		this.code = code;
	}
}

/** Error thrown when a requested resource is not found. */
export class NotFoundError extends AppError {
	constructor(resource: string, id: string) {
		super(`${resource} with id "${id}" not found.`, 'NOT_FOUND');
		this.name = 'NotFoundError';
	}
}

/** Error thrown when a database operation fails. */
export class DatabaseError extends AppError {
	constructor(operation: string, cause?: unknown) {
		const message =
			cause instanceof Error
				? `Database ${operation} failed: ${cause.message}`
				: `Database ${operation} failed.`;
		super(message, 'DATABASE_ERROR');
		this.name = 'DatabaseError';
	}
}

/** Error thrown for validation failures. */
export class ValidationError extends AppError {
	constructor(message: string) {
		super(message, 'VALIDATION_ERROR');
		this.name = 'ValidationError';
	}
}
