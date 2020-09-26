var express = require('express');
var router = express.Router();
var io = require('socket.io')();

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({ sockets: [] }).write();
//db.get('sockets').remove().write();

io.on('connection', (socket) => {
  console.log('a user connected');

  // socket.on('chat message', (msg) => {
  //   console.log('message: ' + msg);

  //   io.emit('chat message', msg);
  // });

  socket.on('connectAndRegister', (msg) => {
    console.log(msg);

    db.get('sockets')
      .push({id: socket.id, sellerId: msg.sellerId })
      .write();
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');

    db.get('sockets')
      .remove(x => x.id = socket.id)
      .write();
  });
});

/* POST callback update order status. */
router.post('/:seller_id', function(req, res, next) {
  
  const sellerId = req.params.seller_id;
  const notification = req.body.notification;

  if (notification) {
    res.status(404).send('POST callback status -> There is no notification');
    return;
  }
  
  const socket = db.get('sockets').find({ sellerId: sellerId }).value();

  if (!socket || !socket.id) {
    res.status(404).send('Callback update status -> Socket not found');
    return;
  }

  const algo = io.to(socket.id)
    .emit('chat message', req.body.notification);

  console.log(algo);
    
  res.status(200).send('POST callback status -> Message send OK');
});

module.exports = {callbackRouter: router, callbackSocket: io};
