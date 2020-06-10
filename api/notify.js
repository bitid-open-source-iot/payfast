var bll     = require('./../bll/bll');
var router  = require('express').Router();

router.use(function timeLog(req, res, next) {
    next();
});

router.post('/itn', (req, res) => {
    var myModule = new bll.module();
    myModule.notify.itn(req, res);
});

router.post('/recurring', (req, res) => {
    var myModule = new bll.module();
    myModule.notify.recurring(req, res);
});

module.exports = router;