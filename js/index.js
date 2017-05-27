window.onload = function () {
    $(".line").hide();
    /*天气详情面板*/
    var wa = $("#weather-about");
    var exponent=$(".exponent");
    var line=$(".line");
    wa.on("click", function () {
        var flag = wa[0].dataset.flag;
        if (flag !== "false") {
            wa.animate({"height": "150px"});
            wa[0].dataset.flag = false;
            exponent.hide();
            $("#canvas_zhexian").height(0);
            $("#canvas_zhexian").width(0);
            $(".line").hide();
        } else {
            wa.animate({"height": "622px"})
            wa[0].dataset.flag = true;
            exponent.show();
            $("#canvas_zhexian").height($(".line").height());
            $("#canvas_zhexian").width($(".line").width());
            $(".line").show();
        }
    });
}