var chart4 = new CanvasJS.Chart("chartContainer4", {
	theme: "light1", // "light1", "light2", "dark1", "dark2"
	exportEnabled: true,
	animationEnabled: true,
	title: {
		text: "Dwelling Ownership"
	},
	data: [{
		type: "pie",
		startAngle: 25,
		toolTipContent: "<b>{label}</b>: {y}",
		//showInLegend: "true",
		//legendText: "{label}",
		indexLabelFontSize: 20,
		indexLabel: "{label} - {y}",
	}]
});

function drawChart(json){	
	
	chart4.options.data[0].dataPoints = [
		{ y: json.dwelling_held_in_family_trust, label: "Held in family trust" },
		{ y: json.dwelling_not_owned, label: "Not owned" },
		{ y: json.dwelling_owned_or_partly_owned, label: "Owned or partly owned" },
		{ y: json.dwelling_rented, label: "Rented" },
	];
	
	chart4.options.data[0].toolTipContent = "<b>{label}</b>: {y}";
	chart4.options.data[0].indexLabel = "{label} - {y}";
	chart4.render();
};


