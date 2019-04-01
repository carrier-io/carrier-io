$(function(){
	$("#wizard").steps({
        headerTag: "h4",
        bodyTag: "section",
        transitionEffect: "fade",
        enableAllSteps: true,
        transitionEffectSpeed: 500,
        onStepChanging: function (event, currentIndex, newIndex) {
            if ( newIndex === 1 && $("#interceptor")[0].checked ) {
                console.log("We need to block second step here")
            } else if ( newIndex === 1 ) {
                $('.steps ul').addClass('step-2');
            } else {
                $('.steps ul').removeClass('step-2');
            }
            if ( newIndex === 2 ) {
                $('#public_dns_review').text($("#dns")[0].value);
                $('#workers_count').text($("#workers")[0].value);
                $('#jenkins_review').html("http://"+$("#dns")[0].value+"/jenkins");
                $('#grafana_review').html("http://"+$("#dns")[0].value+"/grafana");
                $('#grafana_login_review').html($("#grafana_login")[0].value);
                $('#influx_review').html("http://"+$("#dns")[0].value+"/jenkins");
                $('.steps ul').addClass('step-3');
            } else {
                $('.steps ul').removeClass('step-3');
            }
            if ( newIndex === 3 ) {
                $.ajax({
                  type: "POST",
                  url: "/install",
                  data: {
                    dns: $("#dns")[0].value,
                    workers: $("#workers")[0].value,
                    interceptor: $("#interceptor")[0].checked,
                    perfmeter: $("#perfmeter")[0].checked,
                    perfgun: $("#perfgun")[0].checked,
                    dast: $("#dast")[0].checked,
                    sast: $("#sast")[0].checked,
                    grafana_dashboards: $("#grafana")[0].checked,
                    install_jenkins: $("#jenkins")[0].checked,
                    influx_dbs: $("#influx")[0].checked,
                    grafana_url: $("#grafana_url")[0].value,
                    grafana_user: $("#grafana_login")[0].value,
                    grafana_password: $("#grafana_password")[0].value,
                    influx_url: $("#influx_url")[0].value
                    // influx_user: $("#influx_login")[0].value,
                    // influx_password: $("#influx_password")[0].value
                  },
                  success: function(result){ console.log(result) },
                  dataType: 'json'
                });
                $('.steps ul').addClass('step-4');
                $('#install_status').html('<iframe src="/response" height="500px" width="100%"></iframe>')
            } else {
                $('.steps ul').removeClass('step-4');
                $('.actions ul').removeClass('step-last');
            }
            return true; 
        },
        labels: {
            finish: "Done",
            next: "Next",
            previous: "Previous"
        }
    });
    // Custom Steps Jquery Steps
    $('.wizard > .steps li a').click(function(){
    	$(this).parent().addClass('checked');
		$(this).parent().prevAll().addClass('checked');
		$(this).parent().nextAll().removeClass('checked');
    });
    // Custom Button Jquery Steps
    $('.forward').click(function(){
    	$("#wizard").steps('next');
    })
    $('.backward').click(function(){
        $("#wizard").steps('previous');
    })
    // Checkbox
    $('.checkbox-circle label').click(function(){
        $('.checkbox-circle label').removeClass('active');
        $(this).addClass('active');
    })
})

function displayUrl(elem) {
    if ($(elem).hasClass('hidden')) {
        $(elem).removeClass('hidden');
    } else {
        $(elem).addClass('hidden');
    }
}
