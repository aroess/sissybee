var fs = require('fs');

var standardTemplate = function () {
    console.log('init template');
    var head, tail, ready;
    fs.readFile('TMPL', 'utf8', function (err, file) {
        if (err) throw err;
        head = file.split('#con!ent#')[0];
        tail = file.split('#con!ent#')[1];
        ready = true;
    });
    return {
        head : function () {
            return head;
        },
        tail : function () {
            return tail;
        },
        isReady : function () {
            return ready;
        }
    }
};

exports.obj = new standardTemplate();
