var express = require('express');
var serveStatic = require('serve-static');
var fs = require('fs');
var app = express();

app.use(serveStatic(__dirname, {'index': ['index.html']}));

app.use('/shared/css/base.css', function (req, res) {

    fs.readFile(__dirname + '/../shared/css/base.css', function (err, baseCss) {
        if (err) throw err;
        res.write(baseCss);
        res.end();
    });
    
});

app.listen(5900);