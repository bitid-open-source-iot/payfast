var fetch   = require('node-fetch');
var payfast = require('@payfast/core');

var module = function() {
    var bllNotify = {
        errorResponse: {
            "error": {
                "code":    401,
                "message": "BLL Payfast Error",
                "errors": [{
                    "code":         1,
                    "reason":       "General Payfast Error",
                    "message":      "Payfast Error",
                    "locaction":    "bllNotify",
                    "locationType": "body"
                }]
            },
            "hiddenErrors": []
        },

        itn: async (req, res) => {
            const sender = await payfast.validate.sender(req.headers.referer);
            if (!sender.valid && __settings.production) {
                var err                     = bllNotify.errorResponse;
                err.error.errors[0].code    = 401;
                err.error.errors[0].reason  = 'Payfast sender is invalid!';
                err.error.errors[0].message = 'Payfast sender is invalid!';
                __responder.error(req, res, err);
            };
            const verify = await payfast.validate.request(req.body);
            if (!verify.valid && __settings.production) {
                var err                     = bllNotify.errorResponse;
                err.error.errors[0].code    = 401;
                err.error.errors[0].reason  = 'Payfast request is invalid!';
                err.error.errors[0].message = 'Payfast request is invalid!';
                __responder.error(req, res, err);
            };

            if (sender.valid && verify.valid) {
                var args = {
                    "req": req,
                    "res": res
                };
                
                if (args.req.body.payment_status == "COMPLETE") {
                    if (args.req.body.custom_str1 == "order") {
                        orders.process(args);
                    } else if (args.req.body.custom_str1 == "invoice") {
                        invoices.process(args);
                    } else if (args.req.body.custom_str1 == "subscription") {
                        subscriptions.process(args);
                    };
                } else if (args.req.body.payment_status == "CANCELLED") {
                    if (args.req.body.custom_str1 == "order") {
                        orders.cancel(args);
                    } else if (args.req.body.custom_str1 == "invoice") {
                        invoices.cancel(args);
                    } else if (args.req.body.custom_str1 == "subscription") {
                        subscriptions.cancel(args);
                    };
                } else {
                    var err                     = bllNotify.errorResponse;
                    err.error.errors[0].code    = 69;
                    err.error.errors[0].reason  = 'Payfast payment_status not found!';
                    err.error.errors[0].message = 'Payfast payment_status not found!';
                    __responder.error(req, res, err);
                };
            };
        },

        recurring: async (req, res) => {
            const sender = await payfast.validate.sender(req.headers.referer);
            if (!sender.valid && __settings.production) {
                var err                     = bllNotify.errorResponse;
                err.error.errors[0].code    = 401;
                err.error.errors[0].reason  = 'Payfast sender is invalid!';
                err.error.errors[0].message = 'Payfast sender is invalid!';
                __responder.error(req, res, err);
            };
            const verify = await payfast.validate.request({
                "version":          __settings.payfast.version,
                "passphrase":       __settings.payfast.passphrase,
                "merchantId":       __settings.payfast.merchantId,
                "m_payment_id":     req.body.m_payment_id,
                "pf_payment_id":    req.body.pf_payment_id
            });
            if (!verify.valid && __settings.production) {
                var err                     = bllNotify.errorResponse;
                err.error.errors[0].code    = 401;
                err.error.errors[0].reason  = 'Payfast request is invalid!';
                err.error.errors[0].message = 'Payfast request is invalid!';
                __responder.error(req, res, err);
            };
            if (sender.valid && verify.valid) {
                req.body.amount_fee    = parseFloat(req.body.amount_fee);
                req.body.amount_net    = parseFloat(req.body.amount_net);
                req.body.amount_gross  = parseFloat(req.body.amount_gross);

                var args = {
                    "req": req,
                    "res": res
                };
                
                subscriptions.recurring(args);
            };
        }
    };

    var orders = {
        cancel: async (args) => {
            args.req.body.header = {
                'email': __settings.orders.email,
                'appId': __settings.orders.appId
            };

            const url       = [__settings.orders.host, '/store/payfast/cancel'].join('');
            const payload   = JSON.stringify(args.req.body);
            const response  = await fetch(url, {
                'headers': {
                    'Accept':         '*/*',
                    'Content-Type':   'application/json; charset=utf-8',
                    'Authorization':  JSON.stringify(__settings.orders.token),
                    'Content-Length': payload.length
                },
                'body':   payload,
                'method': "POST"
            });
        
            const result = await response.json();
        
            if (typeof(result.errors) != "undefined") {
                __responder.error(args.req, args.res, {'error': result});
            } else {
                __responder.success(args.req, args.res, result);
            };
        },
        process: async (args) => {
            args.req.body.header = {
                'email': __settings.orders.email,
                'appId': __settings.orders.appId
            };

            const url       = [__settings.orders.host, '/store/payfast/payment'].join('');
            const payload   = JSON.stringify(args.req.body);
            const response  = await fetch(url, {
                'headers': {
                    'Accept':         '*/*',
                    'Content-Type':   'application/json; charset=utf-8',
                    'Authorization':  JSON.stringify(__settings.orders.token),
                    'Content-Length': payload.length
                },
                'body':   payload,
                'method': "POST"
            });
        
            const result = await response.json();
        
            if (typeof(result.errors) != "undefined") {
                __responder.error(args.req, args.res, {'error': result});
            } else {
                __responder.success(args.req, args.res, result);
            };
        }
    };

    var invoices = {
        cancel: async (args) => {
            args.req.body.header = {
                'email':        __settings.invoices.email,
                'appId': __settings.invoices.appId
            };

            const url       = [__settings.invoices.host, '/api/payfast/cancel'].join('');
            const payload   = JSON.stringify(args.req.body);
            const response  = await fetch(url, {
                'headers': {
                    'Accept':         '*/*',
                    'Content-Type':   'application/json; charset=utf-8',
                    'Authorization':  JSON.stringify(__settings.invoices.token),
                    'Content-Length': payload.length
                },
                'body':   payload,
                'method': "POST"
            });
        
            const result = await response.json();
        
            if (typeof(result.errors) != "undefined") {
                __responder.error(args.req, args.res, {'error': result});
            } else {
                __responder.success(args.req, args.res, result);
            };
        },
        process: async (args) => {
            args.req.body.header = {
                'email':        __settings.invoices.email,
                'appId': __settings.invoices.appId
            };

            const url       = [__settings.invoices.host, '/api/payfast/payment'].join('');
            const payload   = JSON.stringify(args.req.body);
            const response  = await fetch(url, {
                'headers': {
                    'Accept':         '*/*',
                    'Content-Type':   'application/json; charset=utf-8',
                    'Authorization':  JSON.stringify(__settings.invoices.token),
                    'Content-Length': payload.length
                },
                'body':   payload,
                'method': "POST"
            });
        
            const result = await response.json();
        
            if (typeof(result.errors) != "undefined") {
                __responder.error(args.req, args.res, {'error': result});
            } else {
                __responder.success(args.req, args.res, result);
            };
        }
    };

    var subscriptions = {
        cancel: async (args) => {
            args.req.body.header = {
                'email': __settings.subscriptions.email,
                'appId': __settings.subscriptions.appId
            };

            const url       = [__settings.subscriptions.host, '/api/payfast/cancel'].join('');
            const payload   = JSON.stringify(args.req.body);
            const response  = await fetch(url, {
                'headers': {
                    'Accept':         '*/*',
                    'Content-Type':   'application/json; charset=utf-8',
                    'Authorization':  JSON.stringify(__settings.subscriptions.token),
                    'Content-Length': payload.length
                },
                'body':   payload,
                'method': "POST"
            });
        
            const result = await response.json();
        
            if (typeof(result.errors) != "undefined") {
                __responder.error(args.req, args.res, {'error': result});
            } else {
                __responder.success(args.req, args.res, result);
            };
        },
        process: async (args) => {
            args.req.body.header = {
                'email': __settings.subscriptions.email,
                'appId': __settings.subscriptions.appId
            };

            const url       = [__settings.subscriptions.host, '/api/payfast/payment'].join('');
            const payload   = JSON.stringify(args.req.body);
            const response  = await fetch(url, {
                'headers': {
                    'Accept':         '*/*',
                    'Content-Type':   'application/json; charset=utf-8',
                    'Authorization':  JSON.stringify(__settings.subscriptions.token),
                    'Content-Length': payload.length
                },
                'body':   payload,
                'method': "POST"
            });
        
            const result = await response.json();
        
            if (typeof(result.errors) != "undefined") {
                __responder.error(args.req, args.res, {'error': result});
            } else {
                __responder.success(args.req, args.res, result);
            };
        },
        recurring: async (args) => {
            args.req.body.header = {
                'email': __settings.subscriptions.email,
                'appId': __settings.subscriptions.appId
            };

            const url       = [__settings.subscriptions.host, '/api/payfast/billed'].join('');
            const payload   = JSON.stringify(args.req.body);
            const response  = await fetch(url, {
                'headers': {
                    'Accept':         '*/*',
                    'Content-Type':   'application/json; charset=utf-8',
                    'Authorization':  JSON.stringify(__settings.subscriptions.token),
                    'Content-Length': payload.length
                },
                'body':   payload,
                'method': "POST"
            });
        
            const result = await response.json();
        
            if (typeof(result.errors) != "undefined") {
                __responder.error(args.req, args.res, {'error': result});
            } else {
                __responder.success(args.req, args.res, result);
            };
        }
    };

    return {
        "notify": bllNotify
	};
};

exports.module = module;