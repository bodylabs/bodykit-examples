var express = require('express'),
    config = require('./config'),
    reactViews = require('express-react-views'),
    generateAuthHeader = require('./aclSigner');

var app = express();

app.set('view engine', 'js');
app.engine('js', reactViews.createEngine({
  jsx: {
    extension: '.js',
    harmony: true,
    stripTypes: true
  }
}));

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {

  var standardMeasurements = [
    {id: 'weight'},
    {id: 'height'},
    {id: 'bust_girth'},
    {id: 'waist_girth'},
    {id: 'high_hip_girth'},
    {id: 'full_sleeve_length'},
    {id: 'inseam'},
  ];

  var expireAfterSeconds = config.defaultPolicyExpireInSeconds;

  //Compute ACL header for your user :)
  var aclAuthHeader = generateAuthHeader(config.devAccessKey, 
                                         config.devSecret, 
                                         expireAfterSeconds, 
                                         config.defaultPolicy);
  

  var initialState = {
    baseUrl: config.bodyKitApiBase,
    presetMeasurements: standardMeasurements,
    aclAuthHeader: aclAuthHeader,
    expireAfterSeconds: expireAfterSeconds
  };
  res.render('Html', { data: initialState });
});

app.listen(config.port, function () {
  console.log('Measurements App ACL server example listening on port ' + config.port);
});