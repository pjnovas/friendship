##Friendship [![Build Status](https://secure.travis-ci.org/pjnovas/friendship.png?branch=master)](http://travis-ci.org/pjnovas/friendship) [![Coverage Status](https://coveralls.io/repos/pjnovas/friendship/badge.png)](https://coveralls.io/r/pjnovas/friendship) [![NPM version](https://badge.fury.io/js/friendship.png)](http://badge.fury.io/js/friendship)

Friends Manager for your application, will manage relationships between userids and a socketid, 
which could b-e used with Socket.io to manage the online and offline friends in real time.

### Getting Started

```bash
npm install friendship --save-dev
```

#### Create a friendship Manager
```javascript
var Friendship = require('friendship');

var friendship = new Friendship({
  expire: 3000 //auto checkouts in 3 seconds
});
```

#### Register friends of user with id "uid1"
```javascript
friendship.register('uid1', ['uid2', 'uid3', 'uid4']);
```

#### CheckIn of a user with a Socket
```javascript
friendship.checkin('uid1', 'socketId');
```
After the expire time (set on initialization), this socket will do a checkout 
unless a `.check()` is run before it.

#### Check to reset expiration
```javascript
friendship.check('uid1', 'socketId');
```

#### Checkout of a user socket
```javascript
friendship.checkout('uid1', 'socketId');
```

Can also run a checkout of all sockets that it could have:
```javascript
friendship.checkout('uid1');
```

#### Unregister friends of a user
```javascript
friendship.unregister('uid1');
```
This will run a checkout of all sockets and remove the user from any relationship.
Can be used to make the user to an offline state on every socket.


### TODO
* Add option to use Redis store.
* A way to clear all.

### Contribute

1. Fork this repo
2. run `npm install`
2. Create the tests for the new functionality or bug case
3. Put your awesome code
4. run `grunt test`
5. All good?, place a pull request

