var express = require('express');
var router = express.Router();
const axios = require('axios');

/* GET state listing. */
router.get('/', function(req, res, next) {

  try {
    // Make a GET to list state
    axios.get(process.env.API_OMS_URL + '/api/info/')
      .then(function (response) {
        // handle success
        res.send(response.data);
      })
      .catch(function (error) {
        // handle error
        if (process.env.SHOW_FULL_ERROR == 'TRUE')
          console.log(error);
        
        res.status(400).send("ERROR: GET state from API OMS");
      });
  }
  catch (e) {
    if (process.env.SHOW_FULL_ERROR == 'TRUE')
      console.log(e);
      
    res.status(500).send("ERROR: GET state from API OMS");
  }
});

module.exports = router;
