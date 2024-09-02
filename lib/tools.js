const _ = require('lodash');
const http = require('http');

exports.isIncomingMessage = (param) => {
    return param instanceof http.IncomingMessage;
}

exports.log = (level, message, jsonError, jsonInput, jsonParameters) => {
    try {
        if (this.isIncomingMessage(jsonInput)) {
            jsonInput = {
                headers: jsonInput.headers,
                url: jsonInput.url,
                method: jsonInput.method,
                originalUrl: jsonInput.originalUrl
            }

        }

        if (typeof jsonError !== 'object') {
            jsonError = {
                explanation: jsonError
            };
        }

        if (typeof jsonInput === 'object') {
            jsonError = {
                ...jsonError,
                jsonInput
            }
        }

        if (typeof jsonParameters === 'object') {
            jsonError = {
                ...jsonError,
                jsonParameters
            }
        }

        const logEntry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            ...jsonError
        };
        console.log(JSON.stringify(logEntry));

        let code = _.get(jsonError, `error.code`) || _.get(jsonError, `code`) || 503;
        let errReason = jsonError.description
        let errMessage = jsonError.description
        if (code.toString() == '69') code = 503;
        if (jsonError?.error?.errors?.length > 0) {
            errReason = jsonError?.error?.errors[0]?.reason || jsonError.description
            errMessage = jsonError?.error?.errors[0]?.message || jsonError.description
        }
        var err = {
            error: {
                code: code,
                message: message,
                errors: [
                    {
                        code: code,
                        reason: errReason,
                        message: errMessage
                    }
                ]
            }
        };
        return err;



    } catch (e) {
        console.log(
            {
                timestamp: new Date().toISOString(),
                level: 'error',
                message: 'Error in logging',
                e
            }
        );
    }
}