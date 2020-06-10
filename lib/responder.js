var Q = require('q');

var module = function() {
	var responder = {
		errorResponse: {
			"error": {
				"code": 	1,
				"message": 	"General Error",
				"errors": [{
					"code": 		1,
					"reason": 		"General Error",
					"message": 		"General Error",
					"locaction": 	"Responder",
					"locationType": "responder"
				}]
			}
		},

		model: (req, result) => {
			var deferred = Q.defer();

			switch(req.originalUrl) {
				case('*'):
				case('/api/notify/itn'):
				case('/api/notify/recurring'):
					deferred.resolve(result);
					break;
				
				default:
					deferred.resolve({
						'success': {
							'details': 'Your request resolved successfully but this payload is not modeled!'
						}
					});
					break;
			};

			return deferred.promise;
		},

		error: (req, res, err) => {
			res.status(err.error.code).json(err.error);
		},	

		success: (req, res, result) => {
			responder.model(req, result)
			.then(result => {
				if (Array.isArray(result)) {
					if (typeof(result[0]) !== 'undefined') {
						if (typeof(result[0].error) !== 'undefined') {
							if (result[0].error == 'No records found') {
								responder.errorResponse.error.code 	= 401;
								responder.errorResponse.error.message = 'No records found!';
							};
							responder.error(req, res, responder.errorResponse);
							return;				
						};
					};
				};

				res.json(result);
			}, err => {
				responder.errorResponse.error.code 	= 401;
				responder.errorResponse.error.message = err;
				responder.error(req, res, responder.errorResponse);
			});
		}
	};

	return responder;
};

exports.module = module;