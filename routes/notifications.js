var express = require('express');
var router = express.Router();
const axios = require('axios');
const Joi = require('joi'); 

const postSmsSchema = Joi.object({ 
  order_code: Joi.string()
    .min(3)
    .required(),

  message: Joi.string()
    .min(3)
    .required(), 
}); 

/* POST notifications. */
router.post('/sms', function(req, res, next) {

  const payload = {
    order_code: req.params.order_code,
    message: req.params.message
  }

  console.log(payload);

  // Validate schema
  const result = postSmsSchema.validate(payload);

  if (result.error) {
    res.status(400).send(`POST Notifications -> Schema validation error: ${result.error}`);
    return;
  }

  // Make a POST to send a SMS to Customer
  axios.post(process.env.API_OMS_URL + '/api/send/sms/', payload)
    .then(function (response) {
      // handle success
      res.send(response.data);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
      res.status(400).send(`POST Notifications -> Error received from OMS API: ${error}`);
    })
    .then(function () {
      // always executed
  });
});

module.exports = router;
