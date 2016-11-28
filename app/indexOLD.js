const port = process.env.PORT || 3000;
var app = require('express').createServer();
var io = require('socket.io')(app);

app.listen(port);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});