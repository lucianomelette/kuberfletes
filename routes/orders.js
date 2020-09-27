var express = require('express');
var router = express.Router();
const axios = require('axios');
const Joi = require('joi'); 

// Schema to validate get orders
const getOrdersSchema = Joi.object({
  seller_id: Joi.string()
    .email()
    .required(),

  order_code: Joi.string()
    .min(3),
});

// Schema to validate post orders
const postOrderStatusSchema = Joi.object({ 
  order_code: Joi.string()
    .alphanum()
    .min(3)
    .required(),

  status_code: Joi.string()
    .min(3)
    .required(),
});

/* GET orders listing. */
router.get('/:seller_id', function(req, res, next) {

  try {
    var url = '/api/orders/?';

    var payload = {
      seller_id: req.params.seller_id
    }

    if (req.params.seller_id) url += 'seller_id=' + req.params.seller_id;

    if (req.body.order_code) {
      payload.order_code = req.body.order_code;
      url += '&order_code=' + req.body.order_code;
    }

    console.log(payload);
    console.log(url);

    // Validate schema
    const result = getOrdersSchema.validate(payload);
    
    if (result.error) {
      res.status(400).send(`Get Orders -> Schema validation error: ${result.error}`);
      return;
    }

    // Make a GET to retrieve all orders
    axios.post(process.env.API_OMS_URL + url, payload)
      .then(function (response) {
        // handle success
        res.send(response.data);
      })
      .catch(function (error) {
        // handle error
        if (process.env.SHOW_FULL_ERROR == 'TRUE')
          console.log(error);
        
        res.status(400).send("ERROR: GET orders by seller from API OMS");
      });
    }
    catch(e) {
      if (process.env.SHOW_FULL_ERROR == 'TRUE')
          console.log(e);
      
      res.status(500).send("ERROR: GET orders by seller from API OMS");
    }
});

/* POST order status. */
router.post('/:order_code/status', function(req, res, next) {
  
  try {
    const payload = {
      order_code: req.params.order_code,
      status_code: req.body.status_code
    }

    console.log(payload);

    // Validate schema
    const result = postOrderStatusSchema.validate(payload);
    
    if (result.error) {
      res.status(400).send(`Post Order Status -> Schema validation error: ${result.error}`);
      return;
    }

    // Make a POST to update the order status
    axios.post(process.env.API_OMS_URL + 'api/order-status/', payload)
      .then(function (response) {
        // handle success
        res.send(response.data);
      })
      .catch(function (error) {
        // handle error
        if (process.env.SHOW_FULL_ERROR == 'TRUE')
          console.log(error);
        
        res.status(400).send("ERROR: POST order status to API OMS");
      });
  }
  catch(e) {
    if (process.env.SHOW_FULL_ERROR == 'TRUE')
      console.log(e);
      
    res.status(500).send("ERROR: POST order status to API OMS");
  }
});

// DELETE test only
router.get('/', function(req, res, next) {
  res.render('socket', { title: 'Socket' });
});

module.exports = router;
