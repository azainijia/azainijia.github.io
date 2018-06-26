var express = require('express');
var bodyParser = require('body-parser');
var superAngent = require('superagent');
var fs = require('fs');
var cookieParser = require('cookie-parser')
var app = express();
app.use(express.static('www'))
app.use(bodyParser.urlencoded({extended:false}));
var telNum = [];
// ******************短信接口*****************
app.get('/setcode',function(req,res){
    telNum = [];
    telNum.push(req.query.tel);
    var url = "http://sms.tehir.cn/code/sms/api/v1/send?srcSeqId=123&account=123456789012&password=00743995800&mobile="+req.query.tel+"&code="+ req.query.code+"&time=1";
    superAngent.get(url).end(function(err,data){
        if(err){
            res.json(err)
        }else{
            res.json(data.body)
        }
    })
})
// *******************注册接口*************
app.post('/reg', function (req, res) {
    var fileName = 'users/' + req.body.user + '.txt'
    fs.exists('users', function (exists) {
        if (exists) {
            fs.exists(fileName, function (exists2) {
                if (exists2) {
                    // 用户存在
                    res.status(200).json({
                        num: 1
                    });
                } else {
                    // 用户不存在
                    // 写入文件
                    writeFile()
                    console.log('不存在')
                }
            })
        } else {
            // 不存在users文件夹
            fs.mkdir('users', function (err) {
                if (err) {
                    res.status(200).json({
                        num: 1
                    })
                } else {
                    // 写入文件
                    writeFile()
                }
            })
        }
    })
    // 写入文件
    function writeFile() {
        req.body.tel = telNum.toString();
        fs.writeFile(fileName, JSON.stringify(req.body), function (err) {
            if (err) {
                res.status(200).json({
                    num: 3
                })
            } else {
                res.status(200).json({
                    num: 0,
                    info: req.body.user
                })
            }
        })
    }
})
// ********************登录接口*******************
app.post('/login',function(req,res){
    var fileName = 'users/' + req.body.user + '.txt';
    console.log(fileName)
    fs.exists(fileName,function(ex){
        console.log(ex)
        if(ex){
            fs.readFile(fileName,function(err,data){
                var data = data.toString();
                data = JSON.parse(data);
                if(data.password1 == req.body.password){
                    var date = new Date();
                    date.setDate(date.getDate() + 7);
                    res.cookie('user',req.body.user,data);
                    res.status(200).json({
                        info : '登录成功',
                        code:0
                    })
                }else{
                    res.status(200).json({
                        info : '密码错误',
                        code:2
                    })
                }
            })
        }else{
            res.status(200).json({
                info : '该用户不存在',
                code:1
            })
        }
    })
})
app.listen(2333,function(){
    console.log('服务器开启中.....')
})