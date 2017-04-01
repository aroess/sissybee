var fs = require('fs');

var memDb =  function () {
    console.log('init database');
    var blogData = [], ready= false;
    fs.readdir('data', function (err, fileList) {
        if (err) throw err;
        fileList.forEach(function (file) {
            fs.readFile('data/' + file, 'utf8', function(err, f) {
                if(err) throw err;        
                blogData.push(JSON.parse(f));
                if (blogData.length == fileList.length) {
                    // sort by date, newest first
                    blogData.sort(function (a, b) {
                        return  new Date(parseInt(b.date)).getTime() - 
                                new Date(parseInt(a.date)).getTime();
                    }); 
                    ready = true;
                }
            }); 
        });     
    });
           
    return {
        take : function (count) {
            return blogData.slice(0, count);    
        },
        all : function () {
            return blogData;
        },
        isReady : function () {
            return ready;
        },
        pushComment : function (comment) {
            blogData.forEach(function (entry, index) {
                if (entry.id == comment.id) {
                // update volatile blogData
                blogData[index].comments.push(comment.message);
                // write to disk
                fs.writeFile('data/entry'+entry.id+'.json', 
                JSON.stringify(blogData[index]), function (err) {
                    if (err) throw err;
                });
                }
            });
        }
    }
}; 

exports.obj = new memDb();
