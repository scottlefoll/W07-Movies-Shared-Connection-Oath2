'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');

module.exports.moviesCreatePOST = function moviesCreatePOST (req, res, next, body) {
  Default.moviesCreatePOST(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.moviesDeleteZoe_smithsonPOST = function moviesDeleteZoe_smithsonPOST (req, res, next, body) {
  Default.moviesDeleteZoe_smithsonPOST(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.moviesFirstNameJaneGET = function moviesFirstNameJaneGET (req, res, next) {
  Default.moviesFirstNameJaneGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.moviesGET = function moviesGET (req, res, next) {
  Default.moviesGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.moviesJane_doeGET = function moviesJane_doeGET (req, res, next) {
  Default.moviesJane_doeGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.moviesLastNameDoeGET = function moviesLastNameDoeGET (req, res, next) {
  Default.moviesLastNameDoeGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.moviesUpdateZoe_smithsonPOST = function moviesUpdateZoe_smithsonPOST (req, res, next, body) {
  Default.moviesUpdateZoe_smithsonPOST(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.dbGET = function dbGET (req, res, next) {
  Default.dbGET()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
