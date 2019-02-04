function GWrapper(panelName){
  this.panelName = panelName;
}


GWrapper.prototype.getVar = function(varName, onAllEmpty=true){
  var vars = angular.element('dashboard-submenu').injector().get('variableSrv').variables;
  var result = [];
  vars.forEach(function(variable) {
 	if( variable.name == varName){
	 		if(variable.options[0].value== "$__all" && variable.options[0].selected){
	 			 if (onAllEmpty){return [];} else{
	 			 	for(var i=1; i < variable.options.length; i++){
	 			 		result.push(variable.options[i].value);
	 			 	}
	 			 	return result
	 			 }
			}else{
		 		variable.options.forEach(function(option) {
		 			if (option.selected){result.push(option.value);}
		 		});
			}
  		};
	});

  return result
};


GWrapper.prototype.getTime = function(){

	function getFromTime(timeObj){
	  var from;
	  if(typeof timeObj.from == "string"){
	    from = timeObj.from;
	  }else{
	    from = timeObj.from._d.getTime().toString();
	  }
	 return from;
	}

	function getToTime(timeObj){
	  var to;
	  if(typeof timeObj.to == "string"){
	    to = timeObj.to;
	  }else{
	    to = timeObj.to._d.getTime().toString();
	  }
	  return to;
	}

	function formatTime(time){
		time = time.toString();
	  if(time.includes("now")){
	    time = time.replace("now","now()");
	    time = time.replace("-"," - ");
	    time = time.replace("/"," / ");
	  }else{
	    time = time + "ms";
	  }
	    return time;
	}

    var time = angular.element('grafana-app').injector().get('timeSrv').time;
    var from = (typeof time.from == "string") ? time.from:  time.from._d.getTime();
    var to = (typeof time.to == "string") ? time.to : time.to._d.getTime();
    var timeFilter = 'time > ' + formatTime(from) +' AND time < ' + formatTime(to);

	return {"from": from, "to": to, "filter": timeFilter}
}
