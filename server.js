var express = require('express');
var request = require('request');
var path = require('path')

var app = express();


var basePath = path.join(__dirname,'dest')
console.log(path.join(basePath,'scripts'))
app.use('/scripts', express.static(path.join(basePath,'scripts')));
app.use('/styles', express.static(path.join(basePath, 'styles')));
app.use('/images', express.static(path.join(basePath, 'images')));
app.use('/fonts', express.static(path.join(basePath, 'fonts')));
app.use('/partials', express.static(path.join(basePath, 'partials')));

app.all('/*', function(req, res){
  res.sendFile(basePath + '/index.html');
});


var port = process.env.PORT || 4000;
app.listen(port, function() {
  console.log('server listening on port ' + port);
});