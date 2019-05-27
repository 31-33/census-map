var chart5 = new CanvasJS.Chart("chartContainer5", {
	animationEnabled: true,
	theme: "light1", // "light1", "light2", "dark1", "dark2"
	title: {
		text: "Income Distribution"
	},
	axisY: {
		title: "Annual Income",
		//suffix: "%",
		includeZero: false
	},
	axisX: {
		title: "Income Bracket"
	},
	data: [{
		type: "column",
	}]
});

function drawChart(json){
	
	if (json.income_total_under_5000 == null){
		chart5.options.data[0].dataPoints = [
			{ y: json.total_income_under_5000, label: "< $5000" },
			{ y: json.total_income_10000_20000, label: "$10,000 - $20,000" },
			{ y: json.total_income_20000_30000, label: "$20,000 - $30,000" },
			{ y: json.total_income_30000_50000, label: "$30,000 - $50,000" },
			{ y: json.total_income_50000_more, label: "$50,000 +" },
		];
	}
	else {
		chart5.options.data[0].dataPoints = [
			{ y: json.income_total_under_5000, label: "< $5000" },
			{ y: json.income_total_10000_20000, label: "$10,000 - $20,000" },
			{ y: json.income_total_20000_30000, label: "$20,000 - $30,000" },
			{ y: json.income_total_30000_50000, label: "$30,000 - $50,000" },
			{ y: json.income_total_50000_over, label: "$50,000 +" },
		];
	}

	chart5.render();
};