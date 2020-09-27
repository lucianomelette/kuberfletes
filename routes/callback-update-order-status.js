var express = require('express');
var router = express.Router();
var io = require('socket.io')();
const axios = require('axios');

// Initialize sockets database
initializeSocketsDb();

try {
  // Socket connection
  io.on('connection', (socket) => {
    console.log('A user connected.');

    // Register socket id and seller id on database
    socket.on('connectAndRegister', (msg) => {
      console.log(msg);

      const payload = {socket_id: socket.id, seller_id: msg.sellerId }

      // Make a POST to save socket id on database
      axios.post(process.env.API_OMS_URL + '/api/socket/', payload)
        .then(function (response) {
          // handle success
          console.log('connectAndRegister -> Socket record saved');
        })
        .catch(function (error) {
          // handle error
          console.log("ERROR: Post to save socket on database");

          if (process.env.SHOW_FULL_ERROR == 'TRUE')
            console.log(error);
        });
    });

    // Socket disconnect
    socket.on('disconnect', () => {
      console.log('user disconnected');

      // DELETE socket from database
      axios.delete(process.env.API_OMS_URL + `/api/socket/?socket_id=${socket.id}`)
        .then(function (response) {
          // handle success
          console.log('disconnect -> Socket record deleted');
        })
        .catch(function (error) {
          // handle error
          console.log("ERROR: Disconnect socket, probably socket watn't registered on database.");

          if (process.env.SHOW_FULL_ERROR == 'TRUE')
            console.log(error);
        });
    });
  });
}
catch(e) {
  console.log('Error on socket connection' + (process.env.SHOW_FULL_ERROR == 'TRUE') ? `: ${e}` : '');
}

/* POST callback update order status. */
router.post('/', function(req, res, next) {
  
  try {
    console.log(req.body);

    // const orderCode = req.body.order_code;

    // axios.get(process.env.API_OMS_URL + `/api/order/?order_code=${orderCode}`)
    //   .then((orderResp) => {

    //     if (!orderResp || !orderResp.data) {
    //       res.status(404).send(`Order code not found on db: ${orderCode}`);
    //       return;
    //     }

        if (!req.body.order) {
          res.status(404).send('Order not received');
          return;
        }

        const order = req.body.order; // orderResp.data;
        console.log(order);

        if (!order.seller_id) {
          res.status(404).send('Seller ID not found on order');
          return;
        }

        const sellerId = order.seller_id;
        console.log(sellerId);

        axios.get(process.env.API_OMS_URL + `/api/socket/?seller_id=${sellerId}`)
          .then((socketResp) => {

            if (!socketResp || !socketResp.data) {
              res.status(404).send(`Socket not found on db: ${orderCode}`);
              return;
            }

            const socket = socketResp.data;
            console.log(socket);

            if (!socket.socket_id) {
              res.status(404).send('Socket ID not found on socket record.');
              return;
            }

            const socketId = socket.socket_id;

            io.to(socketId).emit('push order', order);

            res.status(200).send('POST Callback update order status -> Message send OK');
            return;
          })
          .catch((error) => {
            console.log("ERROR: GET socket by seller ID");

            if (process.env.SHOW_FULL_ERROR == 'TRUE')
              console.log(error);
            
            res.status(500).send("ERROR: GET socket by seller ID");
            return;
          });
      // })
      // .catch((error) => {
      //   console.log("ERROR: GET order by order code");

      //   if (process.env.SHOW_FULL_ERROR == 'TRUE')
      //     console.log(error);
        
      //   res.status(500).send("ERROR: GET order by order code");
      //   return;
      // });
  }
  catch(e) {
    console.log("ERROR: POST callback update order status" + (process.env.SHOW_FULL_ERROR == 'TRUE') ? `: ${e}` : '');

    res.status(500).send("ERROR: POST callback update order status");
    return;
  }
});

function initializeSocketsDb() {
  axios.delete(process.env.API_OMS_URL + '/api/socket/?socket_id=all')
    .then(function (response) {
      // handle success
      console.log('initializeSocketsDb OK');
    })
    .catch(function (error) {
      // handle error
      console.log("ERROR: On initialize database.");

      if (process.env.SHOW_FULL_ERROR == 'TRUE')
        console.log(error);

      return;
    });
}

module.exports = {callbackRouter: router, callbackSocket: io};
