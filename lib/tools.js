exports.log = (level, message, jsonError, jsonInput, jsonParameters) => {
    try {
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

        var err = {
            error: {
                errors: [
                    {
                        code: _.get(jsonError, `error.code`),
                        reason: jsonError.message,
                        message: jsonError.message
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