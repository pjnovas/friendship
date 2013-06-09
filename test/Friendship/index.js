
var expect = require('expect.js')
  , _ = require('underscore')
  , Friendship = require('../../lib');

describe('Friendship', function(){
  
  var friendship = new Friendship({
    expire: 30000
  });

  it('should allow to register a friendship', function(){
    var curr = 'uid1'
      , friends = ['uid2', 'uid3', 'uid4'];

    friendship.register(curr, friends);

    expect(friendship._friendsOf).to.be.an('object');
    expect(_.keys(friendship._friendsOf).length).to.be.equal(1);

    expect(friendship._friendsOf[curr]).to.be.an('array');
    expect(friendship._friendsOf[curr].length).to.be.equal(3);

    _.each(friendship._friendsOf[curr], function(id, idx){
      expect(id).to.be.equal('uid' + (idx+2));
    });

  });

  it('should allow to register a friendship with a friend registered', function(){
    var curr = 'uid2'
      , friends = ['uid1', 'uid3', 'uid5'];

    friendship.register(curr, friends);

    expect(friendship._friendsOf).to.be.an('object');
    expect(_.keys(friendship._friendsOf).length).to.be.equal(2);

    expect(friendship._friendsOf[curr]).to.be.an('array');
    expect(friendship._friendsOf[curr].length).to.be.equal(3);

    _.each(friendship._friendsOf[curr], function(id, idx){
      expect(friends.indexOf(id)).to.be.greaterThan(-1);
    });

  });

  it('should allow to checkin with a socketId', function(){
    var curr = 'uid1';

    friendship.checkin(curr, 'sid1-1');

    expect(friendship._socketsOf).to.be.an('object');
    expect(_.keys(friendship._socketsOf).length).to.be.equal(1);

    expect(friendship._socketsOf[curr]).to.be.an('array');
    expect(friendship._socketsOf[curr].length).to.be.equal(1);
    expect(friendship._socketsOf[curr][0]).to.be.equal('sid1-1');
    
    friendship.checkin(curr, 'sid1-2');

    expect(_.keys(friendship._socketsOf).length).to.be.equal(1);

    expect(friendship._socketsOf[curr]).to.be.an('array');
    expect(friendship._socketsOf[curr].length).to.be.equal(2);
    expect(friendship._socketsOf[curr][1]).to.be.equal('sid1-2');
  });

  it('should allow to other user to checkin with a socketId', function(){
    var curr = 'uid2';

    friendship.checkin(curr, 'sid2-1');

    expect(friendship._socketsOf).to.be.an('object');
    expect(_.keys(friendship._socketsOf).length).to.be.equal(2);

    expect(friendship._socketsOf[curr]).to.be.an('array');
    expect(friendship._socketsOf[curr].length).to.be.equal(1);
    expect(friendship._socketsOf[curr][0]).to.be.equal('sid2-1');
    
    friendship.checkin(curr, 'sid2-2');

    expect(_.keys(friendship._socketsOf).length).to.be.equal(2);

    expect(friendship._socketsOf[curr]).to.be.an('array');
    expect(friendship._socketsOf[curr].length).to.be.equal(2);
    expect(friendship._socketsOf[curr][1]).to.be.equal('sid2-2');
  });

  it('should allow to checkin an existance socketId', function(){
    var curr = 'uid1';

    friendship.checkin(curr, 'sid1-1');

    expect(friendship._socketsOf).to.be.an('object');
    expect(_.keys(friendship._socketsOf).length).to.be.equal(2);

    expect(friendship._socketsOf[curr]).to.be.an('array');
    expect(friendship._socketsOf[curr].length).to.be.equal(2);
    expect(friendship._socketsOf[curr][0]).to.be.equal('sid1-1');
  });

  it('should allow to expire a socket if not check is called', function(done){
    var expire = 250
      , friendshipExpire = new Friendship({ expire: expire })
      , curr = 'uid1';

    friendshipExpire.register(curr, ['uid2', 'uid3']);
    friendshipExpire.checkin(curr, 'sid1');

    setTimeout(function(){
      expect(friendshipExpire._socketsOf[curr][0]).to.be.equal('sid1');  
      friendshipExpire.check(curr, 'sid1');
 
      setTimeout(function(){
        expect(friendshipExpire._socketsOf[curr]).to.not.be.ok();

        friendshipExpire.check(curr, 'sid1');
        expect(friendshipExpire._socketsOf[curr][0]).to.be.equal('sid1');

        done();
      }, expire*2);

    }, expire/2);
  });

  it('should allow to checkout a socketId', function(){
    var curr = 'uid1';

    friendship.checkin(curr, 'sid1-3');

    expect(friendship._socketsOf).to.be.an('object');
    expect(_.keys(friendship._socketsOf).length).to.be.equal(2);

    expect(friendship._socketsOf[curr]).to.be.an('array');
    expect(friendship._socketsOf[curr].length).to.be.equal(3);
    expect(friendship._socketsOf[curr][2]).to.be.equal('sid1-3');

    expect(friendship._timeoutOf['sid1-3']).to.be.ok();

    friendship.checkout(curr, 'sid1-3');

    expect(_.keys(friendship._socketsOf).length).to.be.equal(2);

    expect(friendship._socketsOf[curr]).to.be.an('array');
    expect(friendship._socketsOf[curr].length).to.be.equal(2);

    expect(friendship._timeoutOf['sid1-3']).to.not.be.ok();
  });

  it('should allow to checkout a userId with all socketIds', function(){
    var curr = 'uid1';

    expect(_.keys(friendship._friendsOf).length).to.be.equal(2);
    expect(_.keys(friendship._socketsOf).length).to.be.equal(2);

    expect(friendship._socketsOf[curr]).to.be.an('array');
    expect(friendship._socketsOf[curr].length).to.be.equal(2);

    expect(friendship._timeoutOf['sid1-1']).to.be.ok();
    expect(friendship._timeoutOf['sid1-2']).to.be.ok();

    friendship.checkout(curr);

    expect(_.keys(friendship._friendsOf).length).to.be.equal(2);
    expect(_.keys(friendship._socketsOf).length).to.be.equal(1);

    expect(friendship._socketsOf[curr]).to.not.be.ok();
    expect(friendship._timeoutOf['sid1-1']).to.not.be.ok();
    expect(friendship._timeoutOf['sid1-2']).to.not.be.ok();

  });

  it('should allow to unregister a friendship', function(){
    var curr = 'uid2';

    expect(_.keys(friendship._friendsOf).length).to.be.equal(2);
    expect(_.keys(friendship._socketsOf).length).to.be.equal(1);

    expect(friendship._socketsOf[curr]).to.be.an('array');
    expect(friendship._socketsOf[curr].length).to.be.equal(2);

    expect(friendship._timeoutOf['sid2-1']).to.be.ok();
    expect(friendship._timeoutOf['sid2-2']).to.be.ok();

    friendship.unregister(curr);

    expect(_.keys(friendship._friendsOf).length).to.be.equal(1);
    expect(_.keys(friendship._socketsOf).length).to.be.equal(0);

    expect(friendship._socketsOf[curr]).to.not.be.ok();
    expect(friendship._timeoutOf['sid2-1']).to.not.be.ok();
    expect(friendship._timeoutOf['sid2-2']).to.not.be.ok();

  });

});
