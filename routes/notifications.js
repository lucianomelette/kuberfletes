var express = require('express');
var router = express.Router();
const axios = require('axios');
const Joi = require('joi'); 

// Schema to validate post sms
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

  try {
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
        if (process.env.SHOW_FULL_ERROR == 'TRUE')
          console.log(error);

        res.status(500).send("ERROR: POST to send a Notification to Customer.");
      });
  }
  catch(e) {
    if (process.env.SHOW_FULL_ERROR == 'TRUE')
      console.log(e);

    res.status(500).send("ERROR: POST to send a Notification to Customer.");
  }
});

module.exports = router;
