var chart3 = new CanvasJS.Chart("chartContainer3", {
	theme: "light1", // "light1", "light2", "dark1", "dark2"
	exportEnabled: true,
	animationEnabled: true,
	title: {
		text: "Languages"
	},
	data: [{
		type: "pie",
		startAngle: 45,
		toolTipContent: "<b>{label}</b>: {y}%",
		//showInLegend: "true",
		//legendText: "{label}",
		indexLabelFontSize: 20,
		indexLabel: "{label} - {y}%",
	}]
});

function drawChart(result){
	result.then(json => {
		chart3.options.title.text = "Languages - " + json.name
				
		chart3.options.data[0].dataPoints = [
			{ y: json.language_english, label: "English" },
			{ y: json.language_maori, label: "Maori" },
			{ y: json.language_samoan, label: "Samoan" },
			{ y: json.language_nz_sign, label: "Sign" },
			{ y: json.language_other, label: "Other" },
		];
		
		chart3.options.data[0].toolTipContent = "<b>{label}</b>: {y}";
		chart3.options.data[0].indexLabel = "{label} - {y}";
		chart3.render();
	})
};