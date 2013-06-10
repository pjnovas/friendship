
var _ = require('underscore')
  , friendship
  , friendsIO;

var newFriendSocket = function(socket){

  function userCheckin(uid){
    socket.set('uid', uid);
    friendship.checkin(uid, socket.id);
  };

  function userCheck(uid){
    friendship.check(uid, socket.id);
  };

  function userCheckout(){
    socket.get('uid', function(err, uid){ 
      friendship.checkout(uid, socket.id);
    });
  }

  socket.on('user:checkin', userCheckin);
  socket.on('user:check', userCheck);
  socket.on('user:checkout', userCheckout);
  socket.on('disconnect', userCheckout);
};

module.exports = function(io, _friendship, namespace){
  friendship = _friendship;
  friendsIO = io.of('/' + namespace);

  friendship.on('checkin', function(data){
    _.each(data.sockets, function(sid){
      friendsIO.sockets[sid].emit('user:online', data.userId);
    });
  });

  friendship.on('checkout', function(data){
    _.each(data.sockets, function(sid){
      friendsIO.sockets[sid].emit('user:offline', data.userId);
    });
  });

  friendsIO.on('connection', newFriendSocket);
};
