var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , _ = require('underscore');

var Friendship = module.exports = function (options) {
  this.expiration = options.expire;
  this._friendsOf = {};
  this._socketsOf = {};
  this._timeoutOf = {};
};

util.inherits(Friendship, EventEmitter);

Friendship.prototype.register = function(userId, friends) {
  this._friendsOf[userId] = friends;
  return this;
};

Friendship.prototype.unregister = function(userId) {
  if (this._friendsOf.hasOwnProperty(userId)){
    this.checkout(userId);
    this._friendsOf[userId] = [];
    delete this._friendsOf[userId];
  }

  return this;
};

Friendship.prototype.checkin = function(userId, socketId) {
  if (!this._socketsOf[userId]){
    this._socketsOf[userId] = [];  
  }
  
  if (this._socketsOf[userId].indexOf(socketId) === -1){
    this._socketsOf[userId].push(socketId);
  }

  this._timeoutOf[socketId] 
    = setTimeout(this.checkout.bind(this, userId, socketId), this.expiration);

  this.emitEvent(userId, 'checkin');

  return this;
};

Friendship.prototype.check = function(userId, socketId) {
  if (!this._socketsOf[userId]){
    this.checkin(userId, socketId);
  }
  else {
    clearTimeout(this._timeoutOf[socketId]);
    this._timeoutOf[socketId] = 
      setTimeout(this.checkout.bind(this, userId, socketId), this.expire);
  }
  
  return this;
};

Friendship.prototype.checkout = function(userId, socketId) {
  
  function clearUserSockets(){
    this._socketsOf[userId] = [];
    delete this._socketsOf[userId];
    this.emitEvent(userId, 'checkout');
  }

  function clearSocketTimeout(_socketId){
    clearTimeout(this._timeoutOf[_socketId]);
    delete this._timeoutOf[_socketId];
  }

  if (socketId){
    if (this._socketsOf[userId]){
      var idx = this._socketsOf[userId].indexOf(socketId);
      if (idx > -1){
        this._socketsOf[userId].splice(idx, 1);
        
        if (this._socketsOf[userId].length === 0){
          clearUserSockets.call(this);
        }
      }
    }

    if (this._timeoutOf[socketId]){
      clearSocketTimeout.call(this, socketId);
    }
  }
  else {
    _.each(this._socketsOf[userId], function(sid){
      if (this._timeoutOf[sid]){
        clearSocketTimeout.call(this, sid);
      }
    }, this);

    clearUserSockets.call(this);
  }

  return this;
};

Friendship.prototype.emitEvent = function(userId, eventName){
  var friendsIds = this._friendsOf[userId];

  var sockets = [];

  _.each(friendsIds, function(fid){
    _.each(this._socketsOf[fid], function(sid){
      sockets.push(sid);
    });
  }, this);

  this.emit(eventName, {
    userId: userId,
    sockets: sockets
  });
};

Friendship.prototype.events = function(io, options) {
  require('./events')(io, this, options.namespace || 'friends');
};
