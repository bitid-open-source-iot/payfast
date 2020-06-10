var chai            = require('chai');
var chaiSubset      = require('chai-subset');
chai.use(chaiSubset);

var Q       = require('q');
var fetch   = require('node-fetch');
var assert  = require('chai').assert;
var expect  = require('chai').expect;
var should  = require('chai').should();
var config  = require('./config.json');

describe('Notify', function() {
    it('/api/notify/itn', function(done) {
        this.timeout(5000);

        tools.api.notify.itn()
        .then((result) => {
            try {
                result.should.have.property('success');
                done();
            } catch(e) {
                done(e);
            };
        }, (err) => {
            try {
                done(err);
            } catch(e) {
                done(e);
            };
        });
    });
    
    it('/api/notify/recurring', function(done) {
        this.timeout(5000);

        tools.api.notify.recurring()
        .then((result) => {
            try {
                result.should.have.property('success');
                done();
            } catch(e) {
                done(e);
            };
        }, (err) => {
            try {
                done(err);
            } catch(e) {
                done(e);
            };
        });
    });
});

var tools = {
    api: {
        notify: {
            itn: async () => {
                var deferred = Q.defer();
                
                const response = await tools.post('/api/notify/itn', {
                    "token":              "xxx",
                    "name_last":          "",
                    "item_name":          "xxx",
                    "signature":          "xxx",
                    "amount_fee":         "-2.51",
                    "amount_net":         "2.49",
                    "name_first":         "",
                    "custom_str1":        "",
                    "custom_str2":        "",
                    "custom_str3":        "",
                    "custom_str4":        "",
                    "custom_str5":        "",
                    "custom_int1":        "",
                    "custom_int2":        "",
                    "custom_int3":        "",
                    "custom_int4":        "",
                    "custom_int5":        "",
                    "merchant_id":        "xxx",
                    "m_payment_id":       "xxx",
                    "billing_date":       "2020-05-24",
                    "amount_gross":       "5.00",
                    "pf_payment_id":      "xxx",
                    "email_address":      "xxx@xxx.co.za",
                    "payment_status":     "COMPLETE",
                    "item_description":   ""
                });

                deferred.resolve(response);

                return deferred.promise;
            },
            recurring: async () => {
                var deferred = Q.defer();
                
                const response = await tools.post('/api/notify/recurring', {
                    "token":              "xxx",
                    "name_last":          "",
                    "item_name":          "xxx",
                    "signature":          "xxx",
                    "amount_fee":         "-2.51",
                    "amount_net":         "2.49",
                    "name_first":         "",
                    "custom_str1":        "",
                    "custom_str2":        "",
                    "custom_str3":        "",
                    "custom_str4":        "",
                    "custom_str5":        "",
                    "custom_int1":        "",
                    "custom_int2":        "",
                    "custom_int3":        "",
                    "custom_int4":        "",
                    "custom_int5":        "",
                    "merchant_id":        "xxx",
                    "m_payment_id":       "xxx",
                    "billing_date":       "2020-05-24",
                    "amount_gross":       "5.00",
                    "pf_payment_id":      "xxx",
                    "email_address":      "xxx@xxx.co.za",
                    "payment_status":     "COMPLETE",
                    "item_description":   ""
                });

                deferred.resolve(response);

                return deferred.promise;
            }
        }
    },
    post: async (url, payload) => {
        var deferred = Q.defer();

        payload.header = {
            'email':           config.email, 
            'appId':    config.appId
        };

        payload = JSON.stringify(payload);

        const response = await fetch(config.api + url, {
            'headers': {
                'Accept':           '*/*',
                'Content-Type':     'application/json; charset=utf-8',
                'Authorization':    JSON.stringify(config.token),
                'Content-Length':   payload.length
            },
            'body':   payload,
            'method': 'POST'
        });
        
        const result = await response.json();

        deferred.resolve(result);
        
        return deferred.promise;
    }
};