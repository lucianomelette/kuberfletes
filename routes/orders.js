var express = require('express');
var router = express.Router();
const axios = require('axios');
const Joi = require('joi'); 

const getOrdersSchema = Joi.object({
  seller_id: Joi.string()
    .email()
    .required(),

  order_code: Joi.string()
    .min(3),
});

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

  var url = 'api/orders/?';

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
      console.log(error);
      res.status(400).send(`Get Orders -> Error received from OMS API: ${error}`);
    })
    .then(function () {
      // always executed
  });
});

/* POST order status. */
router.post('/:order_code/status', function(req, res, next) {
  
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
      console.log(error);
      res.status(400).send(`Post Order Status -> Error received from OMS API: ${error}`);
    })
    .then(function () {
      // always executed
  });
});

// delete 
router.get('/', function(req, res, next) {
  res.render('socket', { title: 'Socket' });
});

module.exports = router;
