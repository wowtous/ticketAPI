$(document).ready(function(){
    // 首次打开票号获取焦点
    $("#form-num").focus();
    $(".pup-wrap").fadeOut(1);

    // 关闭弹窗
    $(".atm-pupClose").on("touchend click",function(){
        $(this).parents(".pup-wrap").fadeOut(10);
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
            _num = $(this).text();
            _inputObj.value +=_num;
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
    $("#printTicket").click(function(e){
        var orderID = $('#form-num').val();
        var mobile = $('#form-tel').val();
        if(""===orderID||undefined===orderID||orderID.length<=0){
            alert("请输入需要打印的订单号！");
            return null;
        }else if(""===mobile||undefined===mobile||mobile.length!=4){
            alert("请输入正确的手机号码后4位！");
            return null;
        }else {
            $("#ticketLoading").fadeIn(1);
            alert("ticketLoading.");
            $.ajax({
                data:{mobile:mobile,orderID:orderID},
                type:'get',
                url:'http://localhost:3457/print'
            }).done(function(data){
                alert(JSON.stringify(data));
            });

           /* $.ajax({
                dataType:'jsonp',
                url:'http://localhost:3457/print',
                //cache:false,
                data:{
                     mobile  : mobile
                    ,orderID : orderID
                }
            }).done(function(err, data){
                console.log(data);
                $("#ticketLoading").fadeOut(1);
                if(err.error!==0){
                    $("#ticketError").fadeIn(1).fadeOut(5000);
                }else{
                    $("#ticketOutput").fadeIn(1);
                    //TODO printDriver本地打印机打印并返回打印机状态码
                    $("#ticketOutput").fadeOut(1);
                    if(true){
                        $("#ticketGet").fadeIn(1).fadeOut(5000);
                    } else{
                        $("#ticketError").fadeIn(1).fadeOut(5000);
                    }
                }
            }).fail(function(){
                $("#ticketSysError").fadeIn(1).fadeOut(5000);
            });*/
        }
    });
});