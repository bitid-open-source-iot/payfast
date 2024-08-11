var Q           = require('q');
var cors        = require('cors');
var http        = require('http');
var chalk       = require('chalk');
var express     = require('express');
const tools     = require('./lib/tools');
var bodyParser  = require('body-parser');
var responder   = require('./lib/responder');
var healthcheck = require('@bitid/health-check');

global.__base       = __dirname + '/';
global.__settings   = require('./config.json');
global.__responder  = new responder.module();

try {
    var portal = {

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

                app.use('/kubernetes', require('./api/kubernetes'));
                tools.log('info','Loaded ./api/kubernetes',{});

                var notify = require('./api/notify');
                app.use('/api/notify', notify);
                tools.log('info','Loaded ./api/notify',{});

                app.use('/health-check', healthcheck);
                tools.log('info','Loaded ./health-check',{});

                app.use((error, req, res, next) => {
                    let err = tools.log('error','Error in API app.use', error, req)
                    err.error.code              = 500;
                    err.error.message           = 'Something broke';
                    err.error.errors[0].code    = 500;
                    err.error.errors[0].message = 'Something broke';
                    err.hiddenErrors.push(error.stack);
                    __responder.error(req, res, err);
                });

                var server = http.createServer(app);
                server.listen(args.settings.localwebserver.port);
                deferred.resolve(args);
            } catch(err) {
                tools.log('error','Error in API', err, args);
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
                tools.log('info','Webserver Running on port', args.settings.localwebserver.port);
            }, err => {
                tools.log('error','Error Initializing', err);
                console.log('Error Initializing: ', err);
            });
        },

    };

    portal.init({
        'settings': __settings
    });
} catch(error) {
    tools.log('error','Error in payfast.js', error)
};