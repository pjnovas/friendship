
var expect = require('expect.js')
  , io = require('socket.io-client')
  , config = require('./config')
  , socketURL = "http://" + config.host + ":" + config.port

var options ={
  transports: ['websocket'],
  'force new connection': true
};

module.exports = function(friendship){

  describe('Namespace /friends', function(){

    before(function(){
      socketURL += "/friends";
    });

    it('should fire checkin and checkout for friends', function(done){
      var uid1 = 'uid1'
        , friends1 = ['uid2', 'uid3']
        , uid2 = 'uid2'
        , friends2 = ['uid1', 'uid4']
        , firecheckin1 = 0
        , firecheckout2 = 0;

      friendship.register(uid1, friends1);
      friendship.register(uid2, friends2);

      var client_uid1 = io.connect(socketURL, options);
      
      client_uid1.on('user:online', function(userId){
        firecheckin1++;
        expect(userId).to.be.equal(uid2);
      });

      function connectUser(client, uid, done){
        client.on('connect',function(err, data){
          expect(err).to.not.be.ok();
          client.emit('user:checkin', uid);
          done();
        });
      }

      connectUser(client_uid1, uid1, function(){

        setTimeout(function(){
          var client_uid2 = io.connect(socketURL, options);

          client_uid2.on('user:offline', function(userId){
            firecheckout2++;
            expect(userId).to.be.equal(uid1);
          });

          connectUser(client_uid2, uid2, function(){ 
            setTimeout(function(){
              client_uid1.disconnect();
              setTimeout(function(){
                expect(firecheckin1).to.be.equal(1);
                expect(firecheckout2).to.be.equal(1);
                client_uid2.disconnect();
                done();
              }, 50);
            }, 50);
          });
        }, 50);
      });
      
    });

    it('should fire checkout when no check is emitted', function(done){
      var uid1 = 'uid1'
        , friends1 = ['uid2', 'uid3']
        , uid2 = 'uid2'
        , friends2 = ['uid1', 'uid4']
        , firecheckout2 = 0;

      friendship.register(uid1, friends1);
      friendship.register(uid2, friends2);

      var client_uid1 = io.connect(socketURL, options);

      function connectUser(client, uid, done){
        client.on('connect',function(err, data){
          expect(err).to.not.be.ok();
          client.emit('user:checkin', uid);
          done();
        });
      }

      connectUser(client_uid1, uid1, function(){

        setTimeout(function(){
          var client_uid2 = io.connect(socketURL, options);
          
          client_uid2.on('user:offline', function(userId){
            firecheckout2++;
            expect(userId).to.be.equal(uid1);
          });

          connectUser(client_uid2, uid2, function(){ 
            // reset auto checkout for uid1 after uid2 is connected
            client_uid1.emit('user:check', uid1);
            
            setTimeout(function(){
              // wait past expiration, should called offline for uid1

              expect(firecheckout2).to.be.equal(1);
              client_uid1.disconnect();
              client_uid2.disconnect();
              done();
            
            }, 500);
          });
        }, 50);
      });
      
    });


  });

};