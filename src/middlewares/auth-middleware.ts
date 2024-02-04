const ApiErrorAuth = require('../exceptions/api-error')
const tokenServiceAuth = require('../services/tokenService')

module.exports = function (req: any, res: any, next: any) {
	try {
		const authoriaztionHeader = req.headers.authorization;
		if (!authoriaztionHeader) {
			return next(ApiErrorAuth.UnauthorizedError())
		}

		const accessToken = authoriaztionHeader.split(' ')[1];
		if (!accessToken) {
			return next(ApiErrorAuth.UnauthorizedError())
		}

		const userData = tokenServiceAuth.validateAccessToken(accessToken)
		if (!userData) {
			return next(ApiErrorAuth.UnauthorizedError())
		}

		req.user = userData;
		next();
	}
	catch (e) {
		return next(ApiErrorAuth.UnauthorizedError())
	}
}