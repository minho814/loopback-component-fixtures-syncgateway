// Yoinked from https://github.com/JonathanPrince/loopback-component-fixtures

var fs =  require('fs');
var path = require('path');
var async = require('async');
var loopback = require('loopback');
var merge = require('merge');
var app = require('../../server/server.js');
var rp = require('request-promise');
var debug = require('debug')('fixtures:couchbase');

function loadFixtures(models, fixturesPath, callback) {
  var fixturePath = path.join(process.cwd(), fixturesPath);
  var fixtureFolderContents = fs.readdirSync(fixturePath);
  var fixtures = fixtureFolderContents.filter(function(fileName){
    return fileName.match(/\.json$/);
  });

  function loadFixture(fixture, done){
    var fixtureName = fixture.replace('.json', '');
    var fixtureData = require(fixturePath + fixture);

    var url = 'http://' + app.get('host') + ":" + app.get('port') + 
              app.get('restApiRoot') + models[fixtureName].http.path;

    var options = {
      url: url,
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: ''
    };
    function loadData(data, next) {
      options.body = JSON.stringify(data);
      rp(options)
        .then(() => next())
        .catch((err) => {
          debug(err);
          next();
        });
    }

    async.each(fixtureData, loadData, done);

  }

  async.each(fixtures, loadFixture, callback);
}

function removeFixtures(models, fixturesPath, callback) {
  var fixturePath = path.join(process.cwd(), fixturesPath);
  var fixtureFolderContents = fs.readdirSync(fixturePath);
  var fixtures = fixtureFolderContents.filter(function(fileName){
    return fileName.match(/\.json$/);
  });

  function removeFixture(fixture, done){
    var fixtureName = fixture.replace('.json', '');

    models[fixtureName].find()
      .then(res => {

        function removeData(data, next) {
          models[fixtureName].deleteById(data._id)
            .then(() => next())
            .catch(err => {
              debug(err);
              next();
            });
        }

        async.each(res, removeData, done);
        
      })
      .catch(err => {
        debug(err);
        done();
      })
  }

  async.each(fixtures, removeFixture, callback);
}

module.exports = function setupTestFixtures(app, options) {

  options = merge({
    loadFixturesOnStartup: false,
    environments: 'test',
    fixturesPath: '/server/test-fixtures/'
  }, options);

  var environment = app.settings && app.settings.env
    ? app.settings.env : process.env.NODE_ENV;

  var match = Array.isArray(options.environments)
    ? options.environments.indexOf(environment) !== -1
    : environment === options.environments;

  if (!match) {
    return;
  }

  if (options.loadFixturesOnStartup){
    loadFixtures(app.models, options.fixturesPath, function(err){
      if (err) console.log(err);
    });
  }

  var Fixtures = app.model('fixtures', {
    dataSource: false,
    base: 'Model'
  });

  Fixtures.setupFixtures = app.setupFixtures = function(opts, callback){
    if (!callback) callback = opts;
    loadFixtures(app.models, options.fixturesPath, function(){
      callback(null, 'setup complete');
    });
  };

  Fixtures.teardownFixtures = app.teardownFixtures = function(opts, callback){
    if (!callback) callback = opts;

    removeFixtures(app.models, options.fixturesPath, function(){
      callback(null, 'teardown complete');
    });
  };

  Fixtures.remoteMethod('setupFixtures', {
    description: 'Setup fixtures',
    returns: {arg: 'fixtures', type: 'string'},
    http: {path: '/setup', verb: 'get'}
  });

  Fixtures.remoteMethod('teardownFixtures', {
    description: 'Teardown fixtures',
    returns: {arg: 'fixtures', type: 'string'},
    http: {path: '/teardown', verb: 'get'}
  });

};
