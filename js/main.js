// 📝 Fetch all DOM nodes in jQuery and Snap SVG

var container = $('.container');
var card = $('#card');
var innerSVG = Snap('#inner');
var outerSVG = Snap('#outer');
var backSVG = Snap('#back');
var summary = $('#summary');
var date = $('#date');
var weatherContainer1 = Snap.select('#layer1');
var weatherContainer2 = Snap.select('#layer2');
var weatherContainer3 = Snap.select('#layer3');
var innerRainHolder1 = weatherContainer1.group();
var innerRainHolder2 = weatherContainer2.group();
var innerRainHolder3 = weatherContainer3.group();
var innerLeafHolder = weatherContainer1.group();
var innerSnowHolder = weatherContainer1.group();
var innerLightningHolder = weatherContainer1.group();
var leafMask = outerSVG.rect();
var leaf = Snap.select('#leaf');
var sun = Snap.select('#sun');
var sunburst = Snap.select('#sunburst');
var outerSplashHolder = outerSVG.group();
var outerLeafHolder = outerSVG.group();
var outerSnowHolder = outerSVG.group();
var currentWeather="";
var lightningTimeout;
var locationCity = "";
var maxHigh=[];
var maxDate=[];
var maxLow=[];
var maxWeek=[];

// Set mask for leaf holder

outerLeafHolder.attr({
    'clip-path': leafMask
});

// create sizes object, we update this later

var sizes = {
    container: {width: 0, height: 0},
    card: {width: 0, height: 0}
}

// grab cloud groups

var clouds = [
    {group: Snap.select('#cloud1')},
    {group: Snap.select('#cloud2')},
    {group: Snap.select('#cloud3')}
]

// set weather types ☁️ 🌬 🌧 ⛈ ☀️

var weather = [
    {type: 'snow', name: 'Snow'},
    {type: 'wind', name: 'Windy'},
    {type: 'rain', name: 'Rain'},
    {type: 'thunder', name: 'Storms'},
    {type: 'sun', name: 'Sunny'}
];

// 🛠 app settings
// in an object so the values can be animated in tweenmax

var settings = {
    windSpeed: 2,
    rainCount: 0,
    leafCount: 0,
    snowCount: 0,
    cloudHeight: 100,
    cloudSpace: 30,
    cloudArch: 50,
    renewCheck: 10,
    splashBounce: 80
};

var tickCount = 0;
var rain = [];
var leafs = [];
var snow = [];

// ⚙ initialize app

init();

// 👁 watch for window resize

$(window).resize(onResize);

// 🏃 start animations

requestAnimationFrame(tick);

function init() {
    onResize();

    // 🖱 bind weather menu buttons

    for (var i = 0; i < weather.length; i++) {
        var w = weather[i];
        var b = $('#button-' + w.type);
        w.button = b;
        b.bind('click', w, changeWeather);
    }

    // ☁️ draw clouds

    for (var i = 0; i < clouds.length; i++) {
        clouds[i].offset = Math.random() * sizes.card.width;
        drawCloud(clouds[i], i);
    }

    // ☀️ set initial weather

    TweenMax.set(sunburst.node, {opacity: 0});
    //获取当前地理位置  并返回请求的数据

    var map = new BMap.Map("bdMapBox");
    var nowCity = new BMap.LocalCity();
    nowCity.get(bdGetPosition);
    function bdGetPosition(result) {
        locationCity = result.name;
        $(".localtionCity").text(locationCity);
        //请求天气数据
        $.getJSON('http://wthrcdn.etouch.cn/weather_mini?city=' + locationCity, function (wdata) {
            var info = document.getElementsByClassName('info');

            info[0].innerHTML = wdata.data.wendu;
            info[1].innerHTML = wdata.data.forecast[0].date;
            info[2].innerHTML = wdata.data.forecast[0].type;
            $(".localtionCityF").text(wdata.data.wendu + "℃");
            //切换对应的天气动画
            var regyu = /.雨/;
            var reglei = /.雷/;
            var regxue = /.雪/;
            //0 snow   1 wind   2 tain  3 thunder  4sun
            if (regyu.test(wdata.data.forecast[0].type)) {
                changeWeather(weather[2]);
            } else if (wdata.data.forecast[0].type == '多云'||wdata.data.forecast[0].type == '晴') {
                changeWeather(weather[4]);
            } else if (wdata.data.forecast[0].type == '阴') {
                changeWeather(weather[1]);
            } else if (regxue.test(wdata.data.forecast[0].type)) {
                changeWeather(weather[0]);
            } else if (reglei.test(wdata.data.forecast[0].type)) {
                changeWeather(weather[3]);
            }
            //天气面板的天气情况
            var tianqifuture ="";
            //未来天气情况
            for (var i = 0; i < wdata.data.forecast.length; i++) {
                var obj = wdata.data.forecast[i];
                var datadata = obj.date.substring(obj.date.indexOf('星期')+2);
                tianqifuture += '<div class="week-box"><p class="week-word">' +"周"+datadata+ '</p><p class="week-word">' + obj.high + '</p><p class="week-word">' + obj.fengli + '</p><p class="week-word">' + obj.low + '</p><p class="week-word">' + obj.type + '</p></div>';
            }
            $("#weather-future").html(tianqifuture);
            $("#weather-title").text(locationCity);
            // 生活指数9宫格显示
            getExponent(locationCity);
        })
    }
    //搜索框搜索城市天气
    $("#search_button").on("click",function(){
        var locationCity=$("#search").val();
       getWeather(locationCity,function (wdata) {
           if(wdata=='error'){
               alert('您输入的城市有误');
               return;
           }
           var info = document.getElementsByClassName('info');

           info[0].innerHTML = wdata.data.wendu;
           info[1].innerHTML = wdata.data.forecast[0].date;
           info[2].innerHTML = wdata.data.forecast[0].type;

           var regyu = /.雨/;
           var reglei = /.雷/;
           var regxue = /.雪/;
           //0 snow   1 wind   2 tain  3 thunder  4sun
           if (regyu.test(wdata.data.forecast[0].type)) {
               changeWeather(weather[2]);
           } else if (wdata.data.forecast[0].type == '多云'||wdata.data.forecast[0].type == '晴'){
               changeWeather(weather[4]);
           } else if (wdata.data.forecast[0].type == '阴') {
               changeWeather(weather[1]);
           } else if (regxue.test(wdata.data.forecast[0].type)) {
               changeWeather(weather[0]);
           } else if (reglei.test(wdata.data.forecast[0].type)) {
               changeWeather(weather[3]);
           }
           $("#nowCitywendu").text(wdata.data.wendu + "℃");
           $("#nowCityname").text(locationCity);
           $("#weather-title").text(locationCity);
           //天气面板的天气情况
           var tianqifuture ="";
           //未来天气情况
           for (var i = 0; i < wdata.data.forecast.length; i++) {
               var obj = wdata.data.forecast[i];
               var datadata = obj.date.substring(obj.date.indexOf('星期')+2);
               tianqifuture += '<div class="week-box"><p class="week-word">' +"周"+datadata+ '</p><p class="week-word">' + obj.high + '</p><p class="week-word">' + obj.fengli + '</p><p class="week-word">' + obj.low + '</p><p class="week-word">' + obj.type + '</p></div>';
           }
           $("#weather-future").html(tianqifuture);
           $("#weather-title").text(locationCity);
           // 生活指数9宫格显示
           getExponent(locationCity);
       });
    })
    //省会城市天气数据
    var provinces = [{
        "name": "北京市",
        "center": "116.405285,39.904989",
        "type": 0,
        "subDistricts": []
    }, {
        "name": "天津市",
        "center": "117.190182,39.125596",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "石家庄",
        "center": "114.502461,38.045474",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "太原",
        "center": "112.549248,37.857014",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "呼和浩特",
        "center": "111.670801,40.818311",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "沈阳",
        "center": "123.429096,41.796767",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "长春",
        "center": "125.3245,43.886841",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "哈尔滨",
        "center": "126.642464,45.756967",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "上海市",
        "center": "121.472644,31.231706",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "南京",
        "center": "118.767413,32.041544",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "杭州",
        "center": "120.153576,30.287459",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "合肥",
        "center": "117.283042,31.86119",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "福州",
        "center": "119.306239,26.075302",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "南昌",
        "center": "115.892151,28.676493",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "青岛",
        "center": "117.000923,36.675807",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "郑州",
        "center": "113.665412,34.757975",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "武汉",
        "center": "114.298572,30.584355",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "长沙",
        "center": "112.982279,28.19409",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "深圳",
        "center": "113.280637,23.125178",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "南宁",
        "center": "108.320004,22.82402",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "海口",
        "center": "110.33119,20.031971",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "重庆市",
        "center": "106.504962,29.533155",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "成都",
        "center": "104.065735,30.659462",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "贵阳",
        "center": "106.713478,26.578343",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "昆明",
        "center": "102.712251,25.040609",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "西藏自治区",
        "center": "91.132212,29.660361",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "西安",
        "center": "108.948024,34.263161",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "兰州",
        "center": "103.823557,36.058039",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "西宁",
        "center": "101.778916,36.623178",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "银川",
        "center": "106.278179,38.46637",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "乌鲁木齐",
        "center": "87.617733,43.792818",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "台北",
        "center": "121.509062,25.044332",
        "type": 2,
        "subDistricts": []
    }, {
        "name": "香港",
        "center": "114.173355,22.320048",
        "type": 1,
        "subDistricts": []
    }, {
        "name": "澳门",
        "center": "113.54909,22.198951",
        "type": 1,
        "subDistricts": []
    }];
    //添加城市
    var cityArr=[];
    var cityColor='black';
    $("#addCity").on("click", function(){
        if(cityArr.length==7){
            alert('添加城市已满');
            return;
        }
        var str = '';
        $("#list-block").hide();
        $("#citysList").show();
        $("#closeAddcity").show();
        $("#close-ce").hide();
        var json = provinces;

        for (var i = 0; i < json.length; i++) {
            for(var j=0;j<cityArr.length;j++){
                if(json[i].name==cityArr[j]){
                    cityColor='red';
                }
            }
            str += '<li class="item-content" id="nowCity" style="color:'+cityColor+'">' + json[i].name + '</li>'
            cityColor='black'

        }
        $('#citysList').html(str)
        $("#set").hide();
        var childrensList = $("#citysList")[0].children
        for (var i = 0; i < childrensList.length; i++) {
            var chilrdCityname = childrensList[i];
            chilrdCityname.onclick = function () {
                locationCity = this.innerText;

                for(var k=0;k<cityArr.length;k++){
                    if(locationCity==cityArr[k]){
                        alert('该城市已存在！')
                        return;
                    }
                }
                // 创建城市数组
                cityArr.push(locationCity);

                console.log(locationCity)
                console.log(cityArr)

                $("#citysList").hide();
                $("#list-block").show();
                $("#set").show();

                //请求天气数据
                getWeather(locationCity,function (wdata) {

                    var info = document.getElementsByClassName('info');

                    info[0].innerHTML = wdata.data.wendu;
                    info[1].innerHTML = wdata.data.forecast[0].date;
                    info[2].innerHTML = wdata.data.forecast[0].type;

                    var regyu = /.雨/;
                    var reglei = /.雷/;
                    var regxue = /.雪/;
                    //0 snow   1 wind   2 rain  3 thunder  4sun
                    if (regyu.test(wdata.data.forecast[0].type)) {
                        changeWeather(weather[2]);
                    } else if (wdata.data.forecast[0].type == '多云'||wdata.data.forecast[0].type == '晴') {
                        changeWeather(weather[4]);
                    } else if (wdata.data.forecast[0].type == '阴') {
                        changeWeather(weather[1]);
                    } else if (regxue.test(wdata.data.forecast[0].type)) {
                        changeWeather(weather[0]);
                    } else if (reglei.test(wdata.data.forecast[0].type)) {
                        changeWeather(weather[3]);
                    }

                    $(".city_box").append('<li class="item-content" style="padding-left:0;"><div class="item-inner choseCity" style="margin-left:0" ><div class="item-title localtionCity" >'+locationCity+'</div><div class="item-after localtionCityF">'+wdata.data.wendu+'℃'+'</div></div></li>');
                    $("#weather-title").text(locationCity);
                    $("#closeAddcity").hide();
                    $("#close-ce").show();
                    //天气面板的天气情况
                    var tianqifuture ="";
                    //未来天气情况
                    for (var i = 0; i < wdata.data.forecast.length; i++) {
                        var obj = wdata.data.forecast[i];
                        var datadata = obj.date.substring(obj.date.indexOf('星期')+2);
                        tianqifuture += '<div class="week-box"><p class="week-word">' +"周"+datadata+ '</p><p class="week-word">' + obj.high + '</p><p class="week-word">' + obj.fengli + '</p><p class="week-word">' + obj.low + '</p><p class="week-word">' + obj.type + '</p></div>';
                    }
                    $("#weather-future").html(tianqifuture);
                    getExponent(locationCity);
                });
            }
        }
    })}
    //天气侧栏切换城市天气
    $('.city_box').click(function(e){
        var e=e.target;
        $("#weather-title").text(e.innerHTML);
        getWeather(e.innerHTML,function(e){
            if(e=='error'){
                console.log('您输入的城市有误！')
            }else{
                var info = document.getElementsByClassName('info');

                info[0].innerHTML = e.data.wendu;
                info[1].innerHTML = e.data.forecast[0].date;
                info[2].innerHTML = e.data.forecast[0].type;

                var regyu = /.雨/;
                var reglei = /.雷/;
                var regxue = /.雪/;
                //0 snow   1 wind   2 tain  3 thunder  4sun
                if (regyu.test(e.data.forecast[0].type)) {
                    changeWeather(weather[2]);
                } else if (e.data.forecast[0].type == '多云'||e.data.forecast[0].type == '晴'){
                    changeWeather(weather[4]);
                } else if (e.data.forecast[0].type == '阴') {
                    changeWeather(weather[1]);
                } else if (regxue.test(e.data.forecast[0].type)) {
                    changeWeather(weather[0]);
                } else if (reglei.test(e.data.forecast[0].type)) {
                    changeWeather(weather[3]);
                }

                $(".localtionCity").text(e.innerHTML);


                //天气面板的天气情况
                var tianqifuture ="";
                //未来天气情况
                for (var i = 0; i < e.data.forecast.length; i++) {
                    var obj = e.data.forecast[i];
                    var datadata = obj.date.substring(obj.date.indexOf('星期')+2);
                    tianqifuture += '<div class="week-box"><p class="week-word">' +"周"+datadata+ '</p><p class="week-word">' + obj.high + '</p><p class="week-word">' + obj.fengli + '</p><p class="week-word">' + obj.low + '</p><p class="week-word">' + obj.type + '</p></div>';
                }
                $("#weather-future").html(tianqifuture);
                $("#weather-title").text(e.innerHTML);
                // 生活指数9宫格显示
                getExponent(e.innerHTML);
            }
        })
    })
    /*添加城市页面关闭按钮*/
    var closeAddcity = $("#closeAddcity");
    closeAddcity.on("click",function() {
        $("#citysList").hide();
        $("#closeAddcity").hide();
        $("#list-block").show();
        $("#close-ce").show();
    })
    // 天气折线图动态数据导入
$("#canvas_zhexian").height($(".line").height());
$("#canvas_zhexian").width($(".line").width());

//温度转换成纵坐标
function trans(degree){
    return 60+(40-degree)*3;
}
//简单版绘制温度图表
function drawChart(canvasId, maxArr, minArr, dateArr, weekArr) {
    var weekString = weekArr;
    var pi2 = Math.PI*2;
    var canvas =document.getElementById(canvasId);
    var c =canvas.getContext("2d");
    c.font ="12px Times New Roman";
//设置背景渐变
//         var grd=c.createLinearGradient(0,25,0,300);
    // grd.addColorStop(0,"#000066");
    // grd.addColorStop(0.4,"#000055");
    // grd.addColorStop(1,"#000022");
    // // c.fillStyle=grd;
    // c.fillRect(0,19,410,300);
//绘制文字
    c.fillStyle="#ffffff";
    c.textAlign = "center";
    c.fillText("昨天", 25, 28 );
    c.fillText("今天", 80, 28 );
    for(var i=2; i< 6; i++){
        c.fillText(weekString[i], 25+50*i, 28 );
    }
    for(var i=0; i< 6; i++){
        c.fillText(dateArr[i], 25+50*i, 50 );
    }
//绘制最高温度
    c.moveTo(25, trans(maxArr[0]));
    for(var i=1; i< 6; i++){
        c.lineTo(25+50*i, trans(maxArr[i]));
    }
    c.strokeStyle="#ff4444";
    c.stroke();
//绘制最低温度
    c.beginPath();
    c.moveTo(25, trans(minArr[0]));
    for(var i=1; i< 6; i++){
        c.lineTo(25+50*i, trans(minArr[i]));
    }
    c.strokeStyle="#4444ff";
    c.stroke();
//绘制点
    c.fillStyle = "ff4444";
    c.beginPath();
    for(var i=0; i< 6; i++){
        c.moveTo(25+50*i, trans(maxArr[i]));
        c.arc(25+50*i, trans(maxArr[i]), 2, 0, pi2);
    }
    c.fill();
    c.beginPath();
    c.fillStyle = "4444ff";
    for(var i=0; i< 6; i++){
        c.moveTo(25+50*i, trans(minArr[i]));
        c.arc(25+50*i, trans(minArr[i]), 2, 0, pi2);
    }
    c.fill();
}
function zhexian() {
    var maxArr = maxHigh;//最高温度
    var minArr = maxLow;//最低温低
    var dateArr = maxDate;//日期
    var weekArr = maxWeek;//星期
    drawChart("canvas_zhexian", maxArr, minArr, dateArr, weekArr);
}
// 请求canvas画布折现温度数据
    getWeather(locationCity,function (wdata) {

    })
function clearCanvas(){
    var c=document.getElementById("canvas_zhexian");
    var cxt=c.getContext("2d");
    cxt.clearRect(0,0,c.width,c.height);
}

/*获取城市天气接口*/
function getWeather(locationCity,a,b){
    $.getJSON('http://wthrcdn.etouch.cn/weather_mini?city=' + locationCity, function (wdata) {

        for(var i=0;i<wdata.data.forecast.length;i++){
            var maxwendu=wdata.data.forecast[i].high;
            maxHigh.push(Math.floor(maxwendu.substring(3,5)));
        }
        maxHigh.unshift(Math.floor(wdata.data.yesterday.high.substring(3,5)));

        for(var i=0;i<wdata.data.forecast.length;i++){
            var maxwendu=wdata.data.forecast[i].low;
            maxLow.push(Math.floor(maxwendu.substring(3,5)));
        }
        maxLow.unshift(Math.floor(wdata.data.yesterday.low.substring(3,5)));

        for(var i=0;i<wdata.data.forecast.length;i++){
            var maxwendu=wdata.data.forecast[i].date;
            maxDate.push(maxwendu.substring(0,3));
        }
        maxDate.unshift(wdata.data.yesterday.date.substring(0,3));

        for(var i=0;i<wdata.data.forecast.length;i++){
            var maxwendu=wdata.data.forecast[i].date;
            maxWeek.push(maxwendu.substring(3));
        }
        maxWeek.unshift(wdata.data.yesterday.date.substring(3));
        clearCanvas();
        zhexian();
        if(wdata.status ==1002){
            a("error")
            return;
        }

        if(a){
            a(wdata)
        }

        if(b){
            b(wdata);
        }
    })
    changeWeather(weather[1]);
}
/*获取城市生活指数接口*/
function getExponent(locationCity){
    $.getJSON('http://api.help.bj.cn/apis/life27/?id=' + locationCity, function(exponent) {
        var zs=exponent.data;
        var exponent_name=document.getElementsByClassName('exponent_name');
        var exponent_massage=document.getElementsByClassName('exponent_massage');
        // 穿衣指数
        exponent_name[0].innerHTML=zs.zs_cy.name;
        exponent_massage[0].innerHTML=zs.zs_cy.type;
        // 空调指数
        exponent_name[1].innerHTML=zs.zs_kt.name;
        exponent_massage[1].innerHTML=zs.zs_kt.type;
        // 洗车指数
        exponent_name[2].innerHTML=zs.zs_xc.name;
        exponent_massage[2].innerHTML=zs.zs_xc.type;
        // 运动指数
        exponent_name[3].innerHTML=zs.zs_yd.name;
        exponent_massage[3].innerHTML=zs.zs_yd.type;
        // 紫外数指数
        exponent_name[4].innerHTML=zs.zs_zwx.name;
        exponent_massage[4].innerHTML=zs.zs_zwx.type;
        // 化妆指数
        exponent_name[5].innerHTML=zs.zs_hz.name;
        exponent_massage[5].innerHTML=zs.zs_hz.type;
        // 晾晒指数
        exponent_name[6].innerHTML=zs.zs_ls.name;
        exponent_massage[6].innerHTML=zs.zs_ls.type;
        // 路况指数
        exponent_name[7].innerHTML=zs.zs_ly.name;
        exponent_massage[7].innerHTML=zs.zs_ly.type;
        // 雨伞指数
        exponent_name[8].innerHTML=zs.zs_ys.name;
        exponent_massage[8].innerHTML=zs.zs_ys.type;
    })
}

function onResize() {
    // 📏 grab window and card sizes

    sizes.container.width = container.width();
    sizes.container.height = container.height();
    sizes.card.width = card.width();
    sizes.card.height = card.height();
    sizes.card.offset = card.offset();

    // 📐 update svg sizes

    innerSVG.attr({
        width: sizes.card.width,
        height: sizes.card.height
    })

    outerSVG.attr({
        width: sizes.container.width,
        height: sizes.container.height
    })

    backSVG.attr({
        width: sizes.container.width,
        height: sizes.container.height
    })

    TweenMax.set(sunburst.node, {
        transformOrigin: "50% 50%",
        x: sizes.container.width / 2,
        y: (sizes.card.height / 2) + sizes.card.offset.top
    });
    TweenMax.fromTo(sunburst.node, 20, {rotation: 0}, {rotation: 360, repeat: -1, ease: Power0.easeInOut})
    // 🍃 The leaf mask is for the leafs that float out of the
    // container, it is full window height and starts on the left
    // inline with the card

    leafMask.attr({
        x: sizes.card.offset.left,
        y: 0,
        width: sizes.container.width - sizes.card.offset.left,
        height: sizes.container.height
    });
}

function drawCloud(cloud, i) {
    /*

     ☁️ We want to create a shape thats loopable but that can also
     be animated in and out. So we use Snap SVG to draw a shape
     with 4 sections. The 2 ends and 2 arches the same width as
     the card. So the final shape is about 4 x the width of the
     card.

     */

    var space = settings.cloudSpace * i;
    var height = space + settings.cloudHeight;
    var arch = height + settings.cloudArch + (Math.random() * settings.cloudArch);
    var width = sizes.card.width;

    var points = [];
    points.push('M' + [-(width), 0].join(','));
    points.push([width, 0].join(','));
    points.push('Q' + [width * 2, height / 2].join(','));
    points.push([width, height].join(','));
    points.push('Q' + [width * 0.5, arch].join(','));
    points.push([0, height].join(','));
    points.push('Q' + [width * -0.5, arch].join(','));
    points.push([-width, height].join(','));
    points.push('Q' + [-(width * 2), height / 2].join(','));
    points.push([-(width), 0].join(','));

    var path = points.join(' ');
    if (!cloud.path) cloud.path = cloud.group.path();
    cloud.path.animate({
        d: path
    }, 0)
}

function makeRain() {
    // 💧 This is where we draw one drop of rain

    // first we set the line width of the line, we use this
    // to dictate which svg group it'll be added to and
    // whether it'll generate a splash

    var lineWidth = Math.random() * 3;

    // ⛈ line length is made longer for stormy weather

    var lineLength = currentWeather.type == 'thunder' ? 35 : 14;

    // Start the drop at a random point at the top but leaving
    // a 20px margin

    var x = Math.random() * (sizes.card.width - 40) + 20;

    // Draw the line

    var line = this['innerRainHolder' + (3 - Math.floor(lineWidth))].path('M0,0 0,' + lineLength).attr({
        fill: 'none',
        stroke: currentWeather.type == 'thunder' ? '#777' : '#0000ff',
        strokeWidth: lineWidth
    });

    // add the line to an array to we can keep track of how
    // many there are.

    rain.push(line);

    // Start the falling animation, calls onRainEnd when the
    // animation finishes.

    TweenMax.fromTo(line.node, 1, {x: x, y: 0 - lineLength}, {
        delay: Math.random(),
        y: sizes.card.height,
        ease: Power2.easeIn,
        onComplete: onRainEnd,
        onCompleteParams: [line, lineWidth, x, currentWeather.type]
    });
}

function onRainEnd(line, width, x, type) {
    // first lets get rid of the drop of rain 💧

    line.remove();
    line = null;

    // We also remove it from the array

    for (var i in rain) {
        if (!rain[i].paper) rain.splice(i, 1);
    }

    // If there is less rain than the rainCount we should
    // make more.

    if (rain.length < settings.rainCount) {
        makeRain();

        // 💦 If the line width was more than 2 we also create a
        // splash. This way it looks like the closer (bigger)
        // drops hit the the edge of the card

        if (width > 2) makeSplash(x, type);
    }
}

function makeSplash(x, type) {
    // 💦 The splash is a single line added to the outer svg.

    // The splashLength is how long the animated line will be
    var splashLength = type == 'thunder' ? 30 : 20;

    // splashBounce is the max height the line will curve up
    // before falling
    var splashBounce = type == 'thunder' ? 120 : 100;

    // this sets how far down the line can fall
    var splashDistance = 80;

    // because the storm rain is longer we want the animation
    // to last slighly longer so the overall speed is roughly
    // the same for both
    var speed = type == 'thunder' ? 0.7 : 0.5;

    // Set a random splash up amount based on the max splash bounce
    var splashUp = 0 - (Math.random() * splashBounce);

    // Sets the end x position, and in turn defines the splash direction
    var randomX = ((Math.random() * splashDistance) - (splashDistance / 2));

    // Now we put the 3 line coordinates into an array.

    var points = [];
    points.push('M' + 0 + ',' + 0);
    points.push('Q' + randomX + ',' + splashUp);
    points.push((randomX * 2) + ',' + splashDistance);

    // Draw the line with Snap SVG

    var splash = outerSplashHolder.path(points.join(' ')).attr({
        fill: "none",
        stroke: type == 'thunder' ? '#777' : '#0000ff',
        strokeWidth: 1
    });

    // We animate the dasharray to have the line travel along the path

    var pathLength = Snap.path.getTotalLength(splash);
    var xOffset = sizes.card.offset.left;//(sizes.container.width - sizes.card.width) / 2
    var yOffset = sizes.card.offset.top + sizes.card.height;
    splash.node.style.strokeDasharray = splashLength + ' ' + pathLength;

    // Start the splash animation, calling onSplashComplete when finished
    TweenMax.fromTo(splash.node, speed, {
        strokeWidth: 2,
        y: yOffset,
        x: xOffset + 20 + x,
        opacity: 1,
        strokeDashoffset: splashLength
    }, {
        strokeWidth: 0,
        strokeDashoffset: -pathLength,
        opacity: 1,
        onComplete: onSplashComplete,
        onCompleteParams: [splash],
        ease: SlowMo.ease.config(0.4, 0.1, false)
    })
}

function onSplashComplete(splash) {
    // 💦 The splash has finished animating, we need to get rid of it

    splash.remove();
    splash = null;
}

function makeLeaf() {
    var scale = 0.5 + (Math.random() * 0.5);
    var newLeaf;

    var areaY = sizes.card.height / 2;
    var y = areaY + (Math.random() * areaY);
    var endY = y - ((Math.random() * (areaY * 2)) - areaY)
    var x;
    var endX;
    var colors = ['#76993E', '#4A5E23', '#6D632F'];
    var color = colors[Math.floor(Math.random() * colors.length)];
    var xBezier;

    if (scale > 0.8) {
        newLeaf = leaf.clone().appendTo(outerLeafHolder)
            .attr({
                fill: color
            })
        y = y + sizes.card.offset.top / 2;
        endY = endY + sizes.card.offset.top / 2;

        x = sizes.card.offset.left - 100;
        xBezier = x + (sizes.container.width - sizes.card.offset.left) / 2;
        endX = sizes.container.width + 50;
    }
    else {
        newLeaf = leaf.clone().appendTo(innerLeafHolder)
            .attr({
                fill: color
            })
        x = -100;
        xBezier = sizes.card.width / 2;
        endX = sizes.card.width + 50;

    }

    leafs.push(newLeaf);


    var bezier = [{x: x, y: y}, {x: xBezier, y: (Math.random() * endY) + (endY / 3)}, {x: endX, y: endY}]
    TweenMax.fromTo(newLeaf.node, 2, {
        rotation: Math.random() * 180,
        x: x,
        y: y,
        scale: scale
    }, {
        rotation: Math.random() * 360,
        bezier: bezier,
        onComplete: onLeafEnd,
        onCompleteParams: [newLeaf],
        ease: Power0.easeIn
    })
}

function onLeafEnd(leaf) {
    leaf.remove();
    leaf = null;

    for (var i in leafs) {
        if (!leafs[i].paper) leafs.splice(i, 1);
    }

    if (leafs.length < settings.leafCount) {
        makeLeaf();
    }
}

function makeSnow() {
    var scale = 0.5 + (Math.random() * 0.5);
    var newSnow;

    var x = 20 + (Math.random() * (sizes.card.width - 40));
    var endX; // = x - ((Math.random() * (areaX * 2)) - areaX)
    var y = -10;
    var endY;

    if (scale > 0.8) {
        newSnow = outerSnowHolder.circle(0, 0, 5)
            .attr({
                fill: 'white'
            })
        endY = sizes.container.height + 10;
        y = sizes.card.offset.top + settings.cloudHeight;
        x = x + sizes.card.offset.left;
        //xBezier = x + (sizes.container.width - sizes.card.offset.left) / 2;
        //endX = sizes.container.width + 50;
    }
    else {
        newSnow = innerSnowHolder.circle(0, 0, 5)
            .attr({
                fill: 'white'
            })
        endY = sizes.card.height + 10;
        //x = -100;
        //xBezier = sizes.card.width / 2;
        //endX = sizes.card.width + 50;

    }

    snow.push(newSnow);


    TweenMax.fromTo(newSnow.node, 3 + (Math.random() * 5), {x: x, y: y}, {
        y: endY,
        onComplete: onSnowEnd,
        onCompleteParams: [newSnow],
        ease: Power0.easeIn
    })
    TweenMax.fromTo(newSnow.node, 1, {scale: 0}, {scale: scale, ease: Power1.easeInOut})
    TweenMax.to(newSnow.node, 3, {x: x + ((Math.random() * 150) - 75), repeat: -1, yoyo: true, ease: Power1.easeInOut})
}

function onSnowEnd(flake) {
    flake.remove();
    flake = null;

    for (var i in snow) {
        if (!snow[i].paper) snow.splice(i, 1);
    }

    if (snow.length < settings.snowCount) {
        makeSnow();
    }
}

function tick() {
    tickCount++;
    var check = tickCount % settings.renewCheck;

    if (check) {
        if (rain.length < settings.rainCount) makeRain();
        if (leafs.length < settings.leafCount) makeLeaf();
        if (snow.length < settings.snowCount) makeSnow();
    }

    for (var i = 0; i < clouds.length; i++) {
        if (currentWeather.type == 'sun') {
            if (clouds[i].offset > -(sizes.card.width * 1.5)) clouds[i].offset += settings.windSpeed / (i + 1);
            if (clouds[i].offset > sizes.card.width * 2.5) clouds[i].offset = -(sizes.card.width * 1.5);
            clouds[i].group.transform('t' + clouds[i].offset + ',' + 0);
        }
        else {
            clouds[i].offset += settings.windSpeed / (i + 1);
            if (clouds[i].offset > sizes.card.width) clouds[i].offset = 0 + (clouds[i].offset - sizes.card.width);
            clouds[i].group.transform('t' + clouds[i].offset + ',' + 0);
        }
    }

    requestAnimationFrame(tick);
}

function reset() {
    for (var i = 0; i < weather.length; i++) {
        container.removeClass(weather[i].type);
        weather[i].button.removeClass('active');
    }
}

function updateSummaryText() {
    summary.html(currentWeather.name);
    TweenMax.fromTo(summary, 1.5, {x: 30}, {opacity: 1, x: 0, ease: Power4.easeOut});
}

function startLightningTimer() {
    if (lightningTimeout) clearTimeout(lightningTimeout);
    if (currentWeather.type == 'thunder') {
        lightningTimeout = setTimeout(lightning, Math.random() * 6000);
    }
}

function lightning() {
    startLightningTimer();
    TweenMax.fromTo(card, 0.75, {y: -30}, {y: 0, ease: Elastic.easeOut});

    var pathX = 30 + Math.random() * (sizes.card.width - 60);
    var yOffset = 20;
    var steps = 20;
    var points = [pathX + ',0'];
    for (var i = 0; i < steps; i++) {
        var x = pathX + (Math.random() * yOffset - (yOffset / 2));
        var y = (sizes.card.height / steps) * (i + 1)
        points.push(x + ',' + y);
    }

    var strike = weatherContainer1.path('M' + points.join(' '))
        .attr({
            fill: 'none',
            stroke: 'white',
            strokeWidth: 2 + Math.random()
        })

    TweenMax.to(strike.node, 1, {
        opacity: 0, ease: Power4.easeOut, onComplete: function () {
            strike.remove();
            strike = null
        }
    })
}

function changeWeather(weather) {
    if (weather.data) weather = weather.data;
    reset();

    currentWeather = weather;
    TweenMax.killTweensOf(summary);
    TweenMax.to(summary, 1, {opacity: 0, x: -30, onComplete: updateSummaryText, ease: Power4.easeIn})


    container.addClass(weather.type);
    weather.button.addClass('active');

    // windSpeed  wind速

    switch (weather.type) {
        case 'wind':
            TweenMax.to(settings, 3, {windSpeed: 3, ease: Power2.easeInOut});
            break;
        case 'sun':
            TweenMax.to(settings, 3, {windSpeed: 20, ease: Power2.easeInOut});
            break;
        default:
            TweenMax.to(settings, 3, {windSpeed: 0.5, ease: Power2.easeOut});
            break;
    }

    // rainCount rain量

    switch (weather.type) {
        case 'rain':
            TweenMax.to(settings, 3, {rainCount: 10, ease: Power2.easeInOut});
            break;
        case 'thunder':
            TweenMax.to(settings, 3, {rainCount: 60, ease: Power2.easeInOut});
            break;
        default:
            TweenMax.to(settings, 1, {rainCount: 0, ease: Power2.easeOut});
            break;
    }

    // leafCount

    switch (weather.type) {
        case 'wind':
            TweenMax.to(settings, 3, {leafCount: 5, ease: Power2.easeInOut});
            break;
        default:
            TweenMax.to(settings, 1, {leafCount: 0, ease: Power2.easeOut});
            break;
    }

    // snowCount

    switch (weather.type) {
        case 'snow':
            TweenMax.to(settings, 3, {snowCount: 40, ease: Power2.easeInOut});
            break;
        default:
            TweenMax.to(settings, 1, {snowCount: 0, ease: Power2.easeOut});
            break;
    }

    // sun position

    switch (weather.type) {
        case 'sun':
            TweenMax.to(sun.node, 4, {x: sizes.card.width / 2, y: sizes.card.height / 2, ease: Power2.easeInOut});
            TweenMax.to(sunburst.node, 4, {
                scale: 1,
                opacity: 0.8,
                y: (sizes.card.height / 2) + (sizes.card.offset.top),
                ease: Power2.easeInOut
            });
            break;
        default:
            TweenMax.to(sun.node, 2, {x: sizes.card.width / 2, y: -100, leafCount: 0, ease: Power2.easeInOut});
            TweenMax.to(sunburst.node, 2, {
                scale: 0.4,
                opacity: 0,
                y: (sizes.container.height / 2) - 50,
                ease: Power2.easeInOut
            });
            break;
    }

    // lightning

    startLightningTimer();



}