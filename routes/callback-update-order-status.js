var express = require('express');
var router = express.Router();
var io = require('socket.io')();

const axios = require('axios');

initializeSocketsDb();

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('connectAndRegister', (msg) => {
    console.log(msg);

    const payload = {socket_id: socket.id, seller_id: msg.sellerId }

    // Make a POST to save socket id
    axios.post(process.env.API_OMS_URL + '/api/socket/', payload)
      .then(function (response) {
        // handle success
        console.log('connectAndRegister -> Socket record saved');
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');

    // Make a DELETE to delete socket id record
    axios.delete(process.env.API_OMS_URL + `/api/socket/?socket_id=${socket.id}`)
      .then(function (response) {
        // handle success
        console.log('disconnect -> Socket record deleted');
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  });
});

/* POST callback update order status. */
router.post('/', function(req, res, next) {
  
  const orderCode = req.body.order_code;

  axios.get(process.env.API_OMS_URL + `/api/order/?order_code=${orderCode}`)
    .then((res1) => {
      const order = res1.data;
      console.log(order);
      const sellerId = order.seller_id;
      console.log(sellerId);

      axios.get(process.env.API_OMS_URL + `/api/socket/?seller_id=${sellerId}`)
        .then((res2) => {
          const socket = res2.data;
          console.log(socket);
          const socketId = socket.socket_id;

          io.to(socketId).emit('push order', order);

          res.status(200).send('POST Callback update order status -> Message send OK');
        })
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send({error: error.message});
    });
});

function initializeSocketsDb() {
  axios.delete(process.env.API_OMS_URL + '/api/socket/?socket_id=all')
    .then(function (response) {
      // handle success
      console.log('initializeSocketsDb OK');
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

module.exports = {callbackRouter: router, callbackSocket: io};
