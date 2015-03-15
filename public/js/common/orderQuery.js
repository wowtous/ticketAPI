$(document).ready(function(){
    var productType="order";
    //初始化日期控件
    $('.date').datepicker();
    //初始化查询条件框
    $('#queryForm').get(0).reset();
    //表格的初始化
    var oTable = $('#workTable').DataTable({
        "ajax" : {
            url:"/orderQuery/dataTableList"
            ,data:function(d){
                d.orderID = $('#orderID').val();
                d.memberMobile = $('#memberMobile').val();
                d.liveName = $('#liveName').val();
                d.contactPhone = $('#contactPhone').val();
                d.useDate = $('#useDate').val();
                d.status = $('#status').val();
                d.productName = $('#productName').val();
                d.userMobile = $('#userMobile').val();
            }
        }
        ,"iDisplayLength": 10
        ,"serverSide": true
        ,"processing": true
        ,"dom": '<"row"<"col-sm-6 col-sm-offset-6"p>> rt <"row"<"col-6"i>>'
        ,"order": [ 2, 'desc' ]
        ,columns: [
            {data : 'orderID' },
            {data : 'orderDate'},
            {data : 'productType'},
            {data : 'productName'},
            {data : 'useDate'},
            {data : 'quantity'},
            {data : 'totalPrice'},
            {data : 'statusName'}
        ]
        ,"ordering": false
    });

    //点击查询按钮的动作
    $('#query').click(function(e){
        oTable.ajax.reload();
        e.preventDefault();
    });

    //读取图片的逻辑
    var readImage = function(){
        var imageArray=[];
        $('#imgPreview > li').each(function(){
            //var imageObj = {};
            var imgName = $(this).find('.titleBar').html();
            var imgId   = $(this).find('a').attr('id');
            imgName = imgName.replace(/:/,'').replace(/,/,'');
            imgId   = imgId.replace(/:/,'').replace(/,/,'');
            imageArray.push({url:imgId , intro:imgName});
        });
        return JSON.stringify(imageArray);
    };

/*
   //点击订单导出
    $('#orderExport').click(function(e){
        var qs = $('#queryForm').serialize();
        console.log(qs);
        window.location.href = "/orderManagement/export?" + qs;
        e.preventDefault();
    });
*/

    //查看订单详情--静态模态框的弹出
    $('#queryResult').on('click','tr td:first-child',function(){
        if($(this).siblings().length<2)  return;
        var orderID = $(this).parent().data('id');
        $.get('/orderManagement/detail',{orderID:orderID},function(d){
            var template = Handlebars.compile($('#orderDetailModalStatic').html());
            //重新加载模态框中的内容
            $('#modal').html(template(d.data));
            //添加图片
            $.each(d.data.image,function(index,image){
                addImage(image);
            });
            //弹出模态框
            $('#orderDetailStatic').modal('show');
        });
    });

});