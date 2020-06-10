var Q                   = require('q');
var cors                = require('cors');
var http                = require('http');
var chalk               = require('chalk');
var express             = require('express');
var responder           = require('./lib/responder');
var bodyParser          = require('body-parser');

global.__base           = __dirname + '/';
global.__settings       = require('./config.json');
global.__responder      = new responder.module();

try {
    var portal = {
        errorResponse: {
            "error": {
                "code":     401,
                "message":  "Invalid Credentials",
                "errors":[{
                    "reason":       "Portal Error",
                    "message":      "Portal Error",
                    "locaction":    "portal",
                    "locationType": "portal"
                }]
            },
            "hiddenErrors":[]
        },

        api: (args) => {
            var deferred = Q.defer();

            try {
                var app = express();
                app.use(cors());
                app.use(bodyParser.urlencoded({
                    'limit':    '50mb',
                    'extended': true
                }));
                app.use(bodyParser.json({
                    "limit": '50mb'
                }));

                var notify = require('./api/notify');
                app.use('/api/notify', notify);

                app.use((err, req, res, next) => {
                    portal.errorResponse.error.code              = 500;
                    portal.errorResponse.error.message           = 'Something broke';
                    portal.errorResponse.error.errors[0].code    = 500;
                    portal.errorResponse.error.errors[0].message = 'Something broke';
                    portal.errorResponse.hiddenErrors.push(err.stack);
                    __responder.error(req, res, portal.errorResponse);
                });

                var server = http.createServer(app);
                server.listen(args.settings.localwebserver.port);
                deferred.resolve(args);
            } catch(err) {
                deferred.reject(err.message);
            };
            
            return deferred.promise;
        },

        init: (args) => {
            if (!args.settings.production) {
                var index = 0;
                console.log('');
                console.log('=======================');
                console.log('');
                console.log(chalk.yellow('Warning: '));
                if (!args.settings.production) {
                    index++;
                    console.log('');
                    console.log(chalk.yellow(index + ': You are running in ') + chalk.red('"Development Mode!"') + chalk.yellow(' This can cause issues if this environment is a production environment!'));
                    console.log('');
                    console.log(chalk.yellow('To enable production mode, set the ') + chalk.bold(chalk.green('production')) + chalk.yellow(' variable in the config to ') + chalk.bold(chalk.green('true')) + chalk.yellow('!'));
                };
                console.log('');
                console.log('=======================');
                console.log('');
            };

            portal.api(args)
            .then(args => {
                console.log('Webserver Running on port: ', args.settings.localwebserver.port);
            }, err => {
                console.log('Error Initializing: ', err);
            });
        }
    };

    portal.init({
        'settings': __settings
    });
} catch(error) {
    console.log('The following error has occurred: ', error.message);
};