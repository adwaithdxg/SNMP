import { STATUS_CODE } from "./status-code";


class BaseError extends Error {
    public readonly status: number;
    constructor(name: string, status: number, description: string) {
        super(description);
        this.name = name;
        this.status = status;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

//500

export class APIError extends BaseError {
    constructor(description = "Internal server error") {
        super('APIError', STATUS_CODE.INTERNAL_ERROR, description);
    }
}

// 404
export class NotFoundError extends BaseError {
    constructor(description = "NOT FOUND") {
        super('NotFoundError', STATUS_CODE.NOT_FOUND, description);
    }
}

// 400
export class BadRequestError extends BaseError {
    constructor(description = "BAD REQUEST") {
        super('BadRequestError', STATUS_CODE.BAD_REQUEST, description);
    }
}

//404
export class AuthorizeError extends BaseError {
    constructor(description = "Access Denied") {
        super('AuthorizeError', STATUS_CODE.UN_AUTHORIZED, description);
    }
}