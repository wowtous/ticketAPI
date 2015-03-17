var debug = true;

$(document).ready(function(){
    // 首次打开票号获取焦点
    $("#form-num").focus();
    $(".pup-wrap").fadeOut(1);

    // 关闭弹窗
    $(".atm-pupClose").on("touchend click",function(){
        $(this).parents(".pup-wrap").fadeOut(1);
        $('#form-num').val('');
        $('#form-tel').val('');
    });

    //输入
    var _inputObj = document.querySelector("#form-num"); // 首次打开
    var _num = ""; // 值

    $(".atm-form").on("touchend click","input",function(){
        _inputObj = this;
        _num = "";
        $(this).addClass("inputCur").parent().siblings().find("input").removeClass("inputCur");
    });

    // 输入数字
    $(".num-keypad-wrap").on("touchend click",".keypad-item",function(){
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
    });

    //删除数字
    $(".num-keypad-wrap").on("touchend click",".keypad-del",function(){
        var _txtLength = _inputObj.value.length;
        if(_txtLength <= 0){
            return false;
        }else{
            _inputObj.value = _inputObj.value.substring(0,_txtLength-1);
        }
    });

    //切换焦点
    var _toggle = true;
    $(".num-keypad-wrap").on("touchend click",".keypad-ok",function(){
        if(_toggle ==true){
            $("#form-tel").focus().addClass("inputCur").parent().siblings().find("input").removeClass("inputCur");
            _inputObj = document.querySelector("#form-tel");
            _toggle = false;
        }else{
            $("#form-num").focus().addClass("inputCur").parent().siblings().find("input").removeClass("inputCur");
            _inputObj = document.querySelector("#form-num");
            _toggle = true;
        }
    });

    // 动画
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

    // 后台数据交互
    $("#printTicket").on("touchend click",function(e){//.click(function(e){
        e.preventDefault();
        var orderID = $('#form-num').val();
        var mobile = $('#form-tel').val();
        var isOK = false;
        if(""===orderID||undefined===orderID||orderID.length<=0){
            alert("请输入需要打印的订单号！");
            return null;
        }else if(""===mobile||undefined===mobile||mobile.length!=4){
            alert("请输入正确的手机号码后4位！");
            return null;
        }else {
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
                        setTimeout(function(){ $("#ticketGet").fadeOut(1); },5000);
                    },3000);
                } else if(err.error===702 || err.error===703){
                    $('#ticketErrText').text(err.res.errorMsg);
                    $("#ticketError").fadeIn(1);
                    if(err.res.error===699){
                        setTimeout(function(){ $("#ticketError").fadeOut(1); },15000);
                    } else{
                        setTimeout(function(){ $("#ticketError").fadeOut(1); },5000);
                    }
                } else if(err.error===500){
                    $('#ticketErrText').text('应用程序正在准备中，请稍后再试...');
                    $("#ticketError").fadeIn(1);
                    setTimeout(function(){ $("#ticketError").fadeOut(1); },15000);
                } else{
                    $("#ticketSysError").fadeIn(1);
                    setTimeout(function(){ $("#ticketSysError").fadeOut(1); },5000);
                }
                // 清空输入项
                $('#form-num').val('');
                $('#form-tel').val('');
            }).fail(function(err){
                if(debug){
                    console.debug(err.error);
                }
                $("#ticketLoading").fadeOut(1);
                $('#ticketErrText').text('后台程序尚未运行');
                $("#ticketError").fadeIn(1);
                setTimeout(function(){ $("#ticketError").fadeOut(1); },5000);
                // 清空输入项
                $('#form-num').val('');
                $('#form-tel').val('');
            });

            setTimeout(function(){
                if(!isOK){
                    $("#ticketLoading").fadeOut(1);
                    $('#ticketErrText').text('网络故障延迟或后台程序尚未运行');
                    $("#ticketError").fadeIn(1);
                    setTimeout(function(){ $("#ticketError").fadeOut(1); },5000);
                    // 清空输入项
                    $('#form-num').val('');
                    $('#form-tel').val('');
                }
            },20000);
        }
    });
});