// formatting templates
String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) { 
        return typeof args[number] != 'undefined'
            ? args[number] : match;
    });
};
var formatGermanTime = function (timestamp) {
    var months = "Januar,Februar,März,April,Mai,Juni,Juli,August," +
        "September,Oktober,November,Dezember"; months = months.split(',');
    var days = "Sonntag,Montag,Dienstag,Mittwoch,Donnerstag,Freitag," + 
        "Samstag"; days = days.split(',');
    var d = new Date(timestamp);
    return "{0}, den {1}. {2} {3}, um {4} Uhr".format(
        days[d.getDay()], d.getDate(),
        months[d.getMonth()], d.getFullYear(), d.toTimeString().slice(0, 5)
    );
}
var formatBlogEntry = function (data) {
    return ("<b>{0}</b> schrieb am {1}" +
            "<hr>" +
            "<h1>{2}</h1>" +
            "{3}<br><br>" +
            "<h2>Kommentare</h2>" +
            "<input type='text' size='50' name='message'>" +
            "<input type='button' name='send' value='Send'> <hr>"
            ).format(
                data.author, formatGermanTime(parseInt(data.date)),
                data.title, data.text
            );
}
var formatBlogPreview = function (data) {
    var fullViewLink = "";
    if (data.text.length > 250){
        fullViewLink = " ... <a href='/articles?id={0}'>[mehr]</a>".format(data.id);
    }
    return ("<b>{0}</b> schrieb am {1}" +
            "<hr>" +
            "<a href='/articles?id={2}'><h1>{3}</h1></a>" +
            "{4}<br><br>" +
            "<i>{5} Kommentare</i><br><br>").format(
                data.author, formatGermanTime(parseInt(data.date)),
                data.id, data.title, data.text.slice(0, 250) + fullViewLink,
                data.comments.length
            );
}
var formatComment = function (comment, index) {
    return "#{0}@{1}<br>".format(
        (index+1), 
        comment
    );
};

exports.GermanTime  = formatGermanTime;
exports.BlogEntry   = formatBlogEntry;
exports.BlogPreview = formatBlogPreview;
exports.Comment     = formatComment;
