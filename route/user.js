const router = require("express").Router();
const db = require("../model/mydb");
const User = db.User;

// get 的/user/login请求,跳转到登录页面
router.get("/login", function (req, res) {
    res.render("login");
})

// get 的/user/regist请求,跳转到登录页面
router.get("/regist", function (req, res) {
    res.render("regist");
})


// post 的/user/login请求,处理登录
router.post("/login", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    // 判断用户名和密码是否正确
    var filter = {
        username: username,
        password: password
    }
    // 根据用户名密码查询是否正确
    db.findAll(User, filter, function (err, users) {
        if (err) {
            console.log(err);
            res.send({
                status: 1,
                msg: "网络繁忙,稍后再试"
            })
            return;
        }
        if (users.length == 0) {
            // 没找到数据,用户名或密码错误
            res.send({
                status: 1,
                msg: "用户名或密码错误"
            })
            return;
        }
        // 登录成功
        // 保存登录状态
        req.session.username = username;
        // 返回成功的状态
        res.send({
            status: 0,
            msg: "登录成功"
        })
    })
})

// post 的/user/check请求,验证用户名是否存在
router.post("/check", function (req, res) {
    // 获取参数username
    var body = req.body;
    // 根据参数username查询数据
    db.findAll(User, body, function (err, users) {
        if (err) {
            console.log(err);
            res.send({
                status: 2,
                msg: "网络错误,稍后再试"
            })
            return;
        }
        if (users.length > 0) { //user数组中有数据,已存在
            res.send({
                status: 1,
                msg: "用户名已存在"
            });
            return;
        }
        // user数组是空数组
        res.send({
            status: 0,
            msg: "用户名可以使用"
        });

    })

})

// post 的/user/regist请求,注册用户
router.post("/regist", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    // 第二次验证用户名是否存在(防止通过脚本直接发送请求)
    var filter = {
        username: username,
    }
    db.findAll(User, filter, function (err, users) {
        if (err) {
            console.log(err);
            res.send({
                status: 3,
                msg: "网络错误"
            });
            return;
        }
        if (users.length > 0) {
            res.send({
                status: 1,
                msg: "用户名已存在"
            });
            return;
        }
        // 用户名不存在,可以使用
        // 设置用户的默认昵称为用户名
        var data = {}
        data.username = username; //用户名
        data.password = password; //密码
        data.nickname = username; //昵称
        // 保存数据
        db.add(User, data, function (err) {
            if (err) {
                console.log(err);
                res.send({
                    status: 3,
                    msg: "网络错误"
                })
            }
            // 注册成功
            // 保存登录状态
            req.session.username = username;
            res.send({
                status: 0,
                msg: "注册成功"
            });
        })

    })
})

// get /user/logout请求,退出登录
router.get("/logout", function (req, res) {
    // 退出登录,实际上就是将session删除
    req.session.destroy(function (err) {
        res.redirect("/")
    })
})

// get /user/center,跳转到个人中心页面
router.get("/center", function (req, res) {
    // 获取当前登录的用户名
    var username = req.session.username
    var filter = {
        username: username
    }
    // 获取当前登录的用户信息
    db.find(User, filter, function (err, users) {
        if (err) {
            console.log(err);
            res.render("error", {
                msg: "网络错误"
            })
            return;
        }
        if(users.length==0){
            // 登录状态已失效
            req.session.destroy(function(err){
                res.redirect("/")
            })
            return;
        }
        // 返回数据users是一个数组,且只有一个元素
        res.render("center", {user:users[0]})
    })

})

// get /user/update, 修改用户名昵称
router.get("/update",function(req,res){
    // console.log(req.query);
    var username = req.session.username;
    var nickname = req.query.nickname;
    db.modify(User,{username:username},{nickname:nickname},function(err,raw){
        if(err){
            console.log(err);
            res.send({status:1,msg:"修改失败"})
            return;
        }
        console.log(raw);
        res.send({status:0,msg:"修改成功"})
    })
})

module.exports = router;