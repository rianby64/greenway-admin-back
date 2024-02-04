const ApiErrors = require('../exceptions/api-error')

module.exports = function(err: any, req: any, res: any, next: any) {
	console.log(err);
	if (err instanceof ApiErrors) {
		return res.status(err.status).json({message: err.message, errors: err.errors});
	}

	// THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
	return res.status(500).json({message: `Unexpected error: ${err.message}`}) 
}