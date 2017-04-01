var http = require('http'),
    url  = require('url'),
    path = require('path'),
    qs   = require('querystring'),
    fs   = require('fs'),
    format  = require('./format.js'),
    db = require('./database.js'),
    tpl = require('./template.js');

http.createServer(function(request, response){

    var remoteHost = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    var pathname = url.parse(request.url).pathname;
    var query    = url.parse(request.url, true).query;
    
    // check database
    if (!db.obj.isReady()) {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write("Error: database not ready! Try again ... ");
        response.end();
    }
    // check template
    if (!tpl.obj.isReady()) {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write("Error: template not ready! Try again ... ");
        response.end();
    }
    // handle request
    var handle = {};
    handle['/'] = function () {
        console.log(remoteHost + ' --> serving root');
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(tpl.obj.head());
        db.obj.take(5).forEach(function (entry) {
            response.write(format.BlogPreview(entry));
        });
       response.write(tpl.obj.tail());
       response.end();
    };
    handle['/articles'] = function () {
        if (query.id) {
            db.obj.all().forEach(function (entry) {
                if (entry.id == query.id) {
                    console.log(remoteHost + ' --> serving article ' + query.id);
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.write(tpl.obj.head());
                    response.write(format.BlogEntry(entry));
                    entry.comments.forEach(function (comment, index) {
                        response.write(
                            format.Comment(comment, index)
                        );
                    });
                    response.write(tpl.obj.tail());
                }
            });
        }
        response.end();
    };
    handle['/postcomment'] = function () {
        var tooMuch = false;
        if (request.method === 'POST') {
            var postData = "";
            request.on('data', function (data) {
                postData += data;
                if(postData.length > 1000) {
                    console.log('too much data')
                    tooMuch = true;
                    response.writeHead(413, {'Content-Type': 'text/plain'});
                    request.connection.destroy();
                }
            });
            request.on('end', function () {
                if (tooMuch) return;
                try {
                    var comment =  qs.parse(postData);
                    comment.message = comment.message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    comment.message = (new Date()).getTime()+": "+ comment.message;
                    console.log(remoteHost + ' --> posting comment ' + comment.message);
                    db.obj.pushComment(comment);
                    response.writeHead(200, {'Content-Type' : 'text/plain'});
                    response.write('success');
                    response.end();
                } catch (err) {
                    console.log(remoteHost + ' --> posting comment failed with error: ' + err);
                    response.writeHead(500, {'Content-Type' : 'text/plain'});
                    response.write('failed');
                    response.end();
                }
            });
        }
    };   
    if (typeof handle[pathname] === 'function'){
        handle[pathname]();
    } else {
        console.log('No request handler found for ' + pathname);
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.write('404 Not found');
        response.end();
    }

}).listen(3000, 'localhost');

console.log('server running at http://localhost:3000');
    
 
