class HttpError extends Error {
    constructor(error, statusCode) {
        let message = error
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = HttpError;