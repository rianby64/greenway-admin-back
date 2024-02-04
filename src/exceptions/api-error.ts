module.exports = class ApiError extends Error {
	status: any;
	errors: any;

	constructor(status: any, message: any, errors: any = []) {
		super(message);
		this.status = status;
		this.errors = errors;
	}

	static UnauthorizedError() {
		return new ApiError(401, "User is unauthorized")
	}

	static BadRequest(message:any, errors: any = []) {
		return new ApiError(400, message, errors)
	}
}