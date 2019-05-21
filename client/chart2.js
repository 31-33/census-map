var chart2 = new CanvasJS.Chart("chartContainer2", {
	animationEnabled: true,
	theme: "light1", // "light1", "light2", "dark1", "dark2"
	title: {
		text: "Resident Ages"
	},
	axisY: {
		title: "Number of Residents",
		//suffix: "%",
		includeZero: false
	},
	axisX: {
		title: "Age Bracket"
	},
	data: [{
		type: "column",
		//yValueFormatString: "#,##0.0#\"%\"",
		dataPoints: [
			{ label: "India", y: 7.1 },	
			{ label: "China", y: 6.70 },	
			{ label: "Indonesia", y: 5.00 },
			{ label: "Australia", y: 2.50 },	
			{ label: "Mexico", y: 2.30 },
			{ label: "UK", y: 1.80 },
			{ label: "United States", y: 1.60 },
			{ label: "Japan", y: 1.60 }
			
		]
	}]
});

function drawChart(result){
	result.then(json => {
		chart2.options.title.text = "Resident ages - " + json.name
		
		
		chart2.options.data[0].dataPoints = [
			{ y: json.usual_resident_age_0_4, label: "0-4" },
			{ y: json.usual_resident_age_5_9, label: "4-9" },
			{ y: json.usual_resident_age_10_14, label: "10-14" },
			{ y: json.usual_resident_age_15_19, label: "15-19" },
			{ y: json.usual_resident_age_20_24, label: "20-24" },
			{ y: json.usual_resident_age_25_29, label: "25-29" },
			{ y: json.usual_resident_age_30_34, label: "30-34" },
			{ y: json.usual_resident_age_35_39, label: "35-39" },
			{ y: json.usual_resident_age_40_44, label: "40-44" },
			{ y: json.usual_resident_age_45_49, label: "45-49" },
			{ y: json.usual_resident_age_50_54, label: "50-54" },
			{ y: json.usual_resident_age_55_59, label: "55-59" },
			{ y: json.usual_resident_age_60_64, label: "60-64" },
			{ y: json.usual_resident_age_65_over, label: "65+" },
		];
		
		//chart2.options.data[0].toolTipContent = "<b>{label}</b>: {y}%";
		//chart2.options.data[0].indexLabel = "{label} - {y}%";
		chart2.render();
	})
};