
//document.getElementById('div1').style.display = 'block';
 function GraduationCompletedChange(){
 	console.log("reached");
	//$('#GraduationCompletedAlertDiv').hide();
	if($('#GraduationCompletedYes').is(":checked")){
		$("#progress_report_div").hide();
		$("#survey_div").show();
		console.log("yes reached");
		// $("#survey_div").show();
	}

	else if($("#GraduationCompletedNo").is(":checked")){
		$("#progress_report_div").show();
		$("#survey_div").hide();
		console.log("no reached");
		// $("#survey_div").hide();
	}
}

function AddCourseCurrentAY(){
	$("#courseCurrentAYAlertDiv").hide();
	if($("course_currentAY_yes").is(':checked')){
		$("#NoCourseReason_parentDiv").hide();
		$("#courses_currentAY").show();
	}
	else if($("course_currentAY_no").is(':checked')){
		if($("coursesTale_PS").bootstrapTable('getData').length == 0){
			$("#NoCouseReason_parentDiv").show();
		}
		$("#courses_currentAY").hide();
		$("#courseCurrentAYAlertDiv").hide();
	}
}