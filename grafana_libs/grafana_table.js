<script type ="text/javascript" language = "javascript" src="//cdn.jsdelivr.net/gh/carrier-io/carrier-io@master/grafana_libs/grafana_wrapper.js"/>
<script type="text/javascript" language="javascript" src="//cdn.datatables.net/1.10.13/js/jquery.dataTables.min.js"/>
<script>
	function generateQuery(wrapper){
        function appendValues(name,arr){
            return (arr.length) ? (name + '=~ /^(' + arr.join('|') + ')$/ AND ') : '';
        }

        var AND  = ' AND ';
        var WHERE = ' WHERE ';
        var GROUP_BY = ' GROUP BY request_name; ';
        var query;
        var testTypes = wrapper.getVar('test_type', onAllEmpty=false).toString();
        var environments = appendValues('env', wrapper.getVar('env'));
        var userCounts = appendValues('user_count', wrapper.getVar('users'));

        var simulation = ' simulation=\'' +  wrapper.getVar('test')[0] + '\'';
        var timeFilter = wrapper.getTime()['filter'];
        var from_block =  testTypes + WHERE + simulation + AND + userCounts + environments;

        query = 'SELECT SUM(count) AS "total" FROM ' + from_block + 'status= \'all\'' + AND +  timeFilter + GROUP_BY;
        query += 'SELECT SUM(count) AS "ok" FROM ' + from_block +  'status= \'ok\'' + AND + timeFilter + GROUP_BY;

        duplicate_part =  from_block +  'status= \'all\'' + AND +  timeFilter + GROUP_BY;
        query += 'SELECT MEAN(avrg_rps) AS "rps" FROM (SELECT MEAN(count) AS "avrg_rps" FROM ' + from_block +' status= \'ok\' AND ' + timeFilter+ ' GROUP BY time(1s)) GROUP BY request_name;'

        query += 'SELECT MIN(min) AS "min", MEAN(mean) AS "average", MAX(max) AS "max"  FROM ' + duplicate_part;
        query += 'SELECT STDDEV(mean)        AS "stddev" FROM ' + duplicate_part;
        query += 'SELECT MEDIAN(mean)        AS "median" FROM ' + duplicate_part;
        query += 'SELECT PERCENTILE(mean,75) AS "perc75" FROM ' + duplicate_part;
        query += 'SELECT PERCENTILE(mean,95) AS "perc95" FROM ' + duplicate_part;
        query += 'SELECT PERCENTILE(mean,99) AS "perc99" FROM ' + duplicate_part;

        return query;
    };

function formatDataset(data){
    rows = {};
    results = data.results;
    results.forEach(function(result, i) {
        series = result.series;
        series.forEach(function(serie, s) {
            var request_name = serie.tags.request_name
            var keys = serie.columns.slice(1);
            var values = serie.values[0].slice(1);
            var row = (request_name in rows) ? rows[request_name] : {};
            values.forEach( function(value, v) {
                row[keys[v]] = value!=null ? value : 0;
            });
            rows[request_name] = row;
        });
    });
    return rows
}

function appendSTRow(row){
    $('#summary-table').DataTable().row.add(row).draw()
}

function retrieveData(query){
    $.get("$db_url/query", { q: query, db: "$db_name", epoch: EPOCH},
        function(data, status){
            if(status == 'success'){
                var series = data.results[0].series
                if(typeof series == 'undefined'){
                    showErrMessage("No datapoints in selected time range. Try to change filter parameters.")
                }else{
                    removeSpinner()
                    var rows = formatDataset(data)
                    generateSummaryDataTable()
                    for (request_name in rows){
                        request = rows[request_name]
                        var total =  request['total']
                        var ok = request['ok']
                        var ko =  total > ok  ? total - ok : 0

                        var ko_perc = ko > 0 ? parseFloat((ko/total) * 100).toFixed(ROUND_FLOAT_FACTOR) : 0.00
                        var rps = request['rps'] ==null ? 0.0 : parseFloat(request['rps']).toFixed(3)
                        var min = request['min'] ==null ? 0.0 : parseFloat(request['min']/1000).toFixed(ROUND_FLOAT_FACTOR)
                        var median = request['median'] ==null ? 0.0 : parseFloat(request['median']/1000).toFixed(ROUND_FLOAT_FACTOR)
                        var perc75 = request['perc75'] ==null ? 0.0 : parseFloat(request['perc75']/1000).toFixed(ROUND_FLOAT_FACTOR)
                        var perc95 = request['perc95'] ==null ? 0.0 : parseFloat(request['perc95']/1000).toFixed(ROUND_FLOAT_FACTOR)
                        var perc99 = request['perc99'] ==null ? 0.0 : parseFloat(request['perc99']/1000).toFixed(ROUND_FLOAT_FACTOR)
                        var max = request['max'] ==null ? 0.0 : parseFloat(request['max']/1000).toFixed(ROUND_FLOAT_FACTOR)
                        var average = request['average'] ==null ? 0.0 : parseFloat(request['average']/1000).toFixed(ROUND_FLOAT_FACTOR)
                        var stddev = request['stddev'] ==null ? 0.0 : parseFloat(request['stddev']/1000).toFixed(ROUND_FLOAT_FACTOR)
                        row = [request_name, total, ok, ko, ko_perc, rps, min, median, perc75, perc95, perc99, max, average, stddev]

                        appendSTRow(row)
                    }
                }
            }else{
                showErrMessage("Error occured during quering data. Check your datasource settings.")
            }
        });
}

function emptySummaryTable(){
    $("#summary").empty();
}

function addSpinner(){
    if ($('div.spinner').length == 0){
        var spinner = $('<div>')
        spinner.attr("class","spinner");
        spinner.html("<div  style=\"text-align: center;\"> <i class=\"fa fa-spinner fa-spin\" style=\" font-size: xx-large;\"></i> </div>")
        $("#summary").append(spinner)
    }
}
function removeSpinner(){
    $('#summary div.spinner').remove()
}

function initSummaryDataTable(table){
    table.DataTable({
        "empty": true,
        "iDisplayLength": 10,
        "lengthMenu": [[5, 10, 20, 40, -1], [5, 10, 20, 40, "All"]],
        "order": [[ 0, "asc" ]],
        "pagingType": "full_numbers",
        "responsive": true,
        "rowCallback": function(row, data, index){
            // errors
            if(data[4] > 0. && data[4] <= ERROR_PERC_TRESHOLD){
                $(row).find('td:eq(3)').css('color', 'orange');
                $(row).find('td:eq(4)').css('color', 'orange');
            }else if(data[4] > ERROR_PERC_TRESHOLD){
                $(row).find('td:eq(3)').css('color', 'red');
                $(row).find('td:eq(4)').css('color', 'red');
            }
            // response times
            for (var i = 6; i <= 13; i++){

                if(data[i] < LOWER_RT_TRESHOLD){
                    $(row).find('td:eq('+i+')').css('color', 'green');
                    $(row).find('td:eq('+i+')').css('color', 'green');
                }else if(data[i] > HIGHER_RT_TRESHOLD){

                    $(row).find('td:eq('+i+')').css('color', 'red');
                    $(row).find('td:eq('+i+')').css('color', 'red');
                }else{
                    $(row).find('td:eq('+i+')').css('color', 'orange');
                    $(row).find('td:eq('+i+')').css('color', 'orange');
                }
            }
        }
    });
}

function generateSummaryDataTable(){
    emptySummaryTable();
    var table = $('<table>');
    table.attr("id","summary-table");
    table.append(generateSTHead());
    table.append(generateSTBody());
    $('#summary').append(table);
    initSummaryDataTable(table);
    addSTSelectionFeature();
}

function generateSTHead(){
    var cellNames = ["Requests","Total","OK","KO","% KO","Req/s","Min","50th pct","75th pct","95th pct","99th pct","Max","Average","Std Dev"];
    tHead = $('<thead>');
    tHead.attr("id","summary-table-head");
    tRow = $('<tr>');
    for (var i = 0; i < cellNames.length; i++){
        tHeadCell = $('<th>');
        tHeadCell.text(cellNames[i])
        tRow.append(tHeadCell);
    }
    tHead.append(tRow);

    return tHead;
}
function generateSTBody(){
    var tBody = $('<tbody>');
    tBody.attr("id","summary-table-body");

    return tBody;
}

function addSTSelectionFeature(){
    var table = $('#summary-table').DataTable();
    $('#summary-table tbody').on( 'click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        }
        else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
    } );

    $('#button').click( function () {
        table.row('.selected').remove().draw( false );
    } );
}

function showErrMessage(errMessage){
    removeSpinner();
    $("#summary").empty();
    message = $('<span>');
    message.attr("id","summary-table-message");
    message.text(errMessage);
    $("#summary").append(message);
}

function waitForSTGWrapper(){
    addSpinner();
    try{
        var wrapper = new GWrapper("API_Summary_Table");
        checkSTIsLoaded(wrapper)
    }catch(err){
        setTimeout(function() { waitForSTGWrapper()}, 500);
    }
}

function checkSTIsLoaded(wrapper){
    if($.fn.DataTable){
        query = generateQuery(wrapper);
        retrieveData(query)
    }else{
        setTimeout(function() { checkSTIsLoaded()}, 500);
    }
}

// DB_NAME = "perftest";
EPOCH = "ms";
TABLE_TIME_EPOCH = 's'; //s for seconds, any other value for milliseconds

// LOWER_RT_TRESHOLD = 2.0;
// HIGHER_RT_TRESHOLD = 3.0;
LOWER_RT_TRESHOLD = parseFloat("$low_limit")/1000.0
HIGHER_RT_TRESHOLD = parseFloat("$high_limit")/1000.0
ERROR_PERC_TRESHOLD = 1.0;
ROUND_FLOAT_FACTOR = 3;

window.onload = waitForSTGWrapper();
angular.element('grafana-app').injector().get('$rootScope').$on('refresh',function(){waitForSTGWrapper()});
</script>