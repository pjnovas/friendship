
var expect = require('expect.js')
  , express = require('express')
  , socketIO = require('socket.io')
  , http = require('http')
  , path = require('path')
  , config = require('./config')
  , Friendship = require('../../lib');

var server;

describe('Events', function(){

  var io = createExpressApp();

  var friendship = new Friendship({
    expire: 400
  });

  friendship.events(io, { namespace: "friends" });
  require('./events')(friendship);
});

function createExpressApp(){
  var app = express();
  
  app.set('port', process.env.PORT || config.port);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);

  server = http.createServer(app);
  var io = socketIO.listen(server, { log: false });

  server.listen(app.get('port'));

  return io;
}