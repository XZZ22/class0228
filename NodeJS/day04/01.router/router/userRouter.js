//引入express模块
var express = require('express');
//引入body-parser模块
var bodyParser = require('body-parser');
//引入sha1模块
var sha1 = require('sha1');
//引入Users模型对象
var Users = require('../models/Users');
//获取router路由器对象
var Router = express.Router;
//创建路由器
var userRouter = new Router();

//解析请求体，将参数挂在到req.body
userRouter.use(bodyParser.urlencoded({extended: false}));

userRouter.post('/login', function (req, res) {
  //获取用户提交的所有参数
  var username = req.body.username;
  var password = req.body.password;
  Users.findOne({username: username}, function (err, data) {
    if (!err && data && data.password === sha1(password)) {
      res.send('登录成功~~~');
    } else {
      res.send('用户名或密码错误');
    }
  })
})

userRouter.post('/regist', function (req, res) {
  //获取用户提交的参数
  var username = req.body.username;
  var password = req.body.password;
  var rePassword = req.body.rePassword;
  var email = req.body.email;
  /*
    1. 正则验证(-)
    2. 密码和确认密码是否一致
    3. 去数据库中查找有无此用户名
    4. 插入数据
   */
  //正则验证
  var usernameReg = /[a-zA-Z0-9_]{5,12}/  //用户名可以包含大小写英文字符，数字，下划线，长度为5-12位
  var passwordReg = /^[a-zA-Z0-9_]{6,18}$/ //密码可以包含大小写英文字符，数字，下划线，长度为6-18位
  var emailReg = /^[a-z0-9_-]{3,8}@[a-z]{3,6}\.com$/i //邮箱必须符合规范

  if (!usernameReg.test(username)) {
    res.send('用户名不符合规范， 用户名可以包含大小写英文字符，数字，下划线，长度为5-12位');
    return
  }

  if (!passwordReg.test(password)) {
    res.send('密码不符合规范， 密码可以包含大小写英文字符，数字，下划线，长度为6-18位');
    return
  }

  if (!emailReg.test(email)) {
    res.send('邮箱不符合规范， 请按照规范来填写');
    return
  }

  //判断密码和确认密码是否一致
  if (password !== rePassword) {
    res.send('两次密码输入不一致，请重新输入~~');
    return
  }
  //去数据库中查找有无此用户名
  Users.findOne({username: username}, function (err, data) {
    if (!err) {
      /*
        data
          如果查到了  返回文档对象
          如果没找到  返回null
       */
      if (data) {
        // 查到了指定用户名
        res.send(data.username + '用户名已被注册~~请重新输入');
      } else {
        // 没有找到指定有户名，将用户信息插入到数据库中
        Users.create({
          username: username,
          password: sha1(password),
          email: email
        }, function (err) {
          if (!err) {
            res.send('恭喜您，注册成功了~~');
          } else {
            res.send('error');
          }
        })
      }
    } else {
      res.send('error');
    }
  })



})

module.exports = userRouter;