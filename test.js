var express = require('express');
var app = express();
var port=4000;
app.listen(port,()=>{
    console.log(`im listing on ${port}`)
});
app.get('/',function(req,res){
    res.redirect('/home');
});
app.get('/welcome',function(req,res,next){
    res.send('hello again');
    next();
});
app.post('/',function(req,res){
    res.send('hello post');
});
app.get('/home',function(req,res){
    res.sendFile(__dirname + '/'+'test.html');
});
app.get('/profile',function(req,res){
    res.end( 'hello '+req.query.username);
});