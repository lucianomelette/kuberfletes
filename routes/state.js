var express = require('express');
var router = express.Router();
const axios = require('axios');

/* GET state listing. */
router.get('/', function(req, res, next) {

  // Make a GET to list state
  axios.get(process.env.API_OMS_URL + '/api/info/')
    .then(function (response) {
      // handle success
      res.send(response.data);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      res.status(400).send(`GET State -> Error received from OMS API: ${error}`);
    })
    .then(function () {
      // always executed
  });
});

module.exports = router;
