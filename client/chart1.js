var chart1 = new CanvasJS.Chart("chartContainer1", {
	theme: "light1", // "light1", "light2", "dark1", "dark2"
	exportEnabled: true,
	animationEnabled: true,
	title: {
		text: "Gender Distribution"
	},
	data: [{
		type: "pie",
		startAngle: 90,
		toolTipContent: "<b>{label}</b>: {y}%",
		//showInLegend: "true",
		//legendText: "{label}",
		indexLabelFontSize: 20,
		indexLabel: "{label} - {y}%",
		dataPoints: [
			{ y: 40, label: "male" },
			{ y: 60, label: "female" },
		]
	}]
});

function drawChart(result){
	result.then(json => {
		chart1.options.title.text = "Gender Distribution - " + json.name		
		var male = json.usual_resident_male;
		var female = json.usual_resident_female;
		var total = male + female;
		male = Number((male / total * 100).toFixed(2));
		female = Number((female / total * 100).toFixed(2));
		chart1.options.data[0].dataPoints = [
			{ y: male, label: "male" },
			{ y: female, label: "female" },
		];
		
		chart1.options.data[0].toolTipContent = "<b>{label}</b>: {y}%";
		chart1.options.data[0].indexLabel = "{label} - {y}%";
		chart1.render();
	})
};