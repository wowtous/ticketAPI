var debug = true;
var lastClickTime = 0;

$(document).ready(function(){
    // 首次打开票号获取焦点
    $("#form-num").focus();
    $(".pup-wrap").fadeOut(1);

    var _toggle = true;  //切换焦点

    // 关闭弹窗
    $(".atm-pupClose").on("click",function(){
        var tmpClickTime = new Date().getTime();
        if(tmpClickTime - lastClickTime <120){
            return false;
        }else{
            $(this).parents(".pup-wrap").fadeOut(1);
            toggleFocus(!_toggle);
        }
        lastClickTime = tmpClickTime;
    });

    //输入
    var _inputObj = document.querySelector("#form-num"); // 首次打开
    var _num = ""; // 值

    $(".atm-form").on("click","input",function(){
        var tmpClickTime = new Date().getTime();
        if(tmpClickTime - lastClickTime <120){
            return false;
        }else{
            _inputObj = this;
            _num = "";
            $(this).addClass("inputCur").parent().siblings().find("input").removeClass("inputCur");
            if(_inputObj.id==="form-num"){
                _toggle = true;
            } else{
                _toggle = false;
            }
        }
        lastClickTime = tmpClickTime;
    });

    // 输入数字
    $(".num-keypad-wrap").on("click",".keypad-item",function(){
        var tmpClickTime = new Date().getTime();
        if(tmpClickTime - lastClickTime <120){
            return false;
        }else{
            if(typeof _inputObj == "undefined"){
                _num = "";
                return false;
            }else{
                if(_inputObj.id === "form-num" && _inputObj.value.length<10){
                    _num = $(this).text();
                    _inputObj.value +=_num;
                } else if(_inputObj.id === "form-tel" && _inputObj.value.length<4){
                    _num = $(this).text();
                    _inputObj.value +=_num;
                }
            }
        }
        lastClickTime = tmpClickTime;
    });

    //删除数字
    $(".num-keypad-wrap").on("click",".keypad-del",function(){
        var tmpClickTime = new Date().getTime();
        if(tmpClickTime - lastClickTime <120){
            return false;
        }else{
            var _txtLength = _inputObj.value.length;
            if(_txtLength <= 0){
                return false;
            }else{
                _inputObj.value = _inputObj.value.substring(0,_txtLength-1);
            }
        }
        lastClickTime = tmpClickTime;
    });

    //切换焦点
    //var _toggle = true;
    $(".num-keypad-wrap").on("click",".keypad-ok",function(){
        var tmpClickTime = new Date().getTime();
        if(tmpClickTime - lastClickTime <120){
            return false;
        }else{
            if(_toggle){
                toggleFocus(_toggle);
            } else {
                ticketSubmit();
            }
        }
        lastClickTime = tmpClickTime;
    });

    // 动画
    $(".load-item2").velocity({
        //bottom:0,
        opacity:0.3
    },{
        duration:800,
        loop:true
    });
    $(".chupiao i").velocity({
        bottom:-12,
        opacity:1
    },{
        duration:800,
        loop:true
    });
    $(".chupiao2 i").velocity({
        bottom:-3,
        right:-4,
        opacity:1
    },{
        duration:800,
        loop:true
    });

    var toggleFocus = function(t){
        if(t == true){
            $("#form-tel").focus().addClass("inputCur").parent().siblings().find("input").removeClass("inputCur");
            _inputObj = document.querySelector("#form-tel");
            _toggle = false;
        }else{
            $("#form-num").focus().addClass("inputCur").parent().siblings().find("input").removeClass("inputCur");
            _inputObj = document.querySelector("#form-num");
            _toggle = true;
        }
    };

    var ticketOut = function(obj1,obj2,isArgsKeep){
        if(typeof(obj1) !=="undefined" && obj1 ){ obj1.fadeIn(1); }
        if(typeof(obj2) !=="undefined" && obj2 ){ obj2.fadeOut(1); }
        if(!isArgsKeep){
            // 清空输入项
            $('#form-num').val('');
            $('#form-tel').val('');
            toggleFocus(false);
        } else {
            toggleFocus(!_toggle);
        }
    };

    // 后台数据处理
    var ticketSubmit = function(){//.click(function(e){
        var tmpClickTime = new Date().getTime();
        if(tmpClickTime - lastClickTime <120){
            return false;
        }else{
            var orderID = $('#form-num').val();
            var mobile = $('#form-tel').val();
            var isOK = false;
            if(""===orderID||typeof(orderID)==="undefined"||orderID.length<=0){
                $('#ticketErrText').text('请输入票号！');
                ticketOut($("#ticketError"),null,true);
                return false;
            } else if(""===mobile||typeof(mobile)==="undefined"||mobile.length!=4){
                $('#ticketErrText').text('请输入手机号码后4位！');
                ticketOut($("#ticketError"),null,true);
                return false;
            } else {
                $("#ticketLoading").fadeIn(1);
                $.ajax({
                    dataType:'jsonp',
                    url:'http://localhost:3457/print',
                    cache:false,
                    data:{
                         mobile  : mobile
                        ,orderID : orderID
                    }
                }).done(function(err){
                    if(debug){
                        console.debug(err.error);
                    }
                    isOK = true;
                    $("#ticketLoading").fadeOut(1);
                    if(err.error===0){
                        $("#ticketOutput").fadeIn(1);
                        setTimeout(function(){
                            $("#ticketOutput").fadeOut(1);
                            $("#ticketGet").fadeIn(1);
                            setTimeout(function(){ ticketOut(null,$("#ticketGet"),false); },5000);
                        },3000);
                    } else if(err.error===704){
                        $("#ticketSysError").fadeIn(1);
                        setTimeout(function(){ ticketOut(null,$("#ticketSysError"),true); },5000);
                    } else if(err.error===500){
                        $('#ticketErrText').text('请求本地客户端超时，请重试或联系客服!');
                        $("#ticketError").fadeIn(1);
                        setTimeout(function(){ ticketOut(null,$("#ticketError"),true); },10000);
                    } else {
                        $('#ticketErrText').text(err.errorMsg);
                        $("#ticketError").fadeIn(1);
                        if(err.error===699){
                            setTimeout(function(){ ticketOut(null,$("#ticketError"),true); },10000);
                        } else{
                            setTimeout(function(){ ticketOut(null,$("#ticketError"),true); },5000);
                        }
                    }
                });

                setTimeout(function(){
                    if(!isOK){
                        $("#ticketLoading").fadeOut(1);
                        $('#ticketErrText').text('请求本地客户端超时，请重试或联系客服!');
                        $("#ticketError").fadeIn(1);
                        setTimeout(function(){ ticketOut(null,$("#ticketError"),true); },5000);
                    }
                },20000);
            }
        }
        lastClickTime = tmpClickTime;
    };

    // 后台数据交互
    $("#printTicket").on("click",function(e){
        e.preventDefault();
        ticketSubmit()
    });
});