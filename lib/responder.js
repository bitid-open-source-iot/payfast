var Q = require('q');
const tools = require('../lib/tools')

var module = function() {
	var responder = {

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
								let err = tools.log('error', 'error in responder.success', 'No records found', { reqBody: req?.body, reqAuthorization: req?.authorization }, result);
								err.error.code 	= 401;
								err.error.message = 'No records found!';
							};
							responder.error(req, res, err);
							return;				
						};
					};
				};

				res.json(result);
			}, error => {
				let err = tools.log('error','error in responder.success', error, { reqBody: req?.body, reqAuthorization: req?.authorization }, result);
				err.error.code 	= 401;
				err.error.message = err;
				responder.error(req, res, err);
			});
		}
	};

	return responder;
};

exports.module = module;