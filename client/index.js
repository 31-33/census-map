var map = L.map('map');
const nz_bounds = [[-33.87, 164.36], [-48.17, 179.30]];
const globalMin = {
	median_income: 0,
	usual_resident_total: 0,
	weekly_rent_median: 20,
	dwellings_total: 0,
};
const globalMax = {
	median_income: 1896,
	usual_resident_total: 150000,
	weekly_rent_median: 500,
	dwellings_total: 1000,
};
var heatmapProp = 'usual_resident_total';
const colours = [
	'#cce6ff',
	'#99ccff',
	'#66b3ff',
	'#3399ff',
	'#0080ff',
	'#0066cc',
	'#004d99',
	'#004080',
	'#00264d',
	'#001a33',
];
const charts = [
	"chart1.js",
	"chart2.js",
	"chart3.js",
	"chart4.js",
	"chart5.js"
]

var heatmapLegend = L.control({ position: 'topright' });
heatmapLegend.onAdd = function(map) {
	var container = L.DomUtil.create('div', 'leaflet');
	container.innerHTML = `
	<div style="display:inline-block; vertical-align: top;">
		<div style="height: 185px; float:right;">${globalMin[heatmapProp]}</div>
		<div>${globalMax[heatmapProp]}</div>
	</div>
	<div style="display:inline-block;">
		${colours.map(colour => {
			return `<div style="width: 40px; height: 20px; background-color: ${colour};"></div>`
		}).join('')}
	</div>`;

	return container;
}

var zoomStack = [];
var dataStack = [];

var heatmapSelectionControl = L.Control.extend({
	options: {
		position: 'topright'
	},
	onAdd: function(map){
		var container = L.DomUtil.create('div', 'leaflet-bar leaflet control');
		container.innerHTML = `
		<select>
			<option value='usual_resident_total'>Population</option>
			<option value='median_income'>Median Income</option>
			<option value='weekly_rent_median'>Median Weekly Rent</option>
			<option value='dwellings_total'>Number of Dwellings</option>
		</select`;

		container.addEventListener('change', event => {
			heatmapProp = event.target.value;
			redrawCurrentLevel();
		});

		return container;
	}
})

var backLevelControl = L.Control.extend({
	options: {
		position: 'topleft'
	},
	
	onAdd: function (map){

		var container = L.DomUtil.create('div', 'leaflet-bar leaflet control backLayerButton');
		container.title = "Go back one layer";
		container.innerText = "↺";
		container.style.cursor = "pointer";

		container.onclick = function(){
			decreaseRegionLevel();
		}
		return container;
	},
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', 
	{
		foo: 'bar', 
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	}).addTo(map);
map.addControl(new backLevelControl());
map.addControl(new heatmapSelectionControl());

let layergroup = L.layerGroup().addTo(map);
const wkt = new Wkt.Wkt();
var infoPopup = L.popup();

function drawPolygon(layergroup, data, color, callback) {
	wkt.read(data.wkt);
	const polygon = wkt.toObject({
		fillColor: color,
		opacity: 1,
		fillOpacity: 0.6,
		color: 'black',
		weight: 0.5,
	});
	layergroup.addLayer(
		polygon
			.on('click', () => callback(data.id, polygon._bounds))
			.on('mouseover', (event) => {
				infoPopup.setLatLng(polygon._bounds.getCenter()).setContent(`
					<h3>${data.name}</h3>
					<ul>
						<li>Median Income: ${data.median_income}</li>
						<li>Population: ${data.usual_resident_total}</li>
						<li>Median Weekly Rent: ${data.weekly_rent_median}</li>
						<li>Number of Dwellings: ${data.dwellings_total}</li>
					</ul>`).openOn(map);
			})
			.on('mouseout', (event) => map.closePopup(infoPopup))
	);
}

function onRegionClicked(region_id, bounds) {
	fetch(`/region/${region_id}`)
		.then(res => res.json())
		.then(json => {
			while(dataStack.length > 1){
				dataStack.pop();
			}
			dataStack.push(json);
			drawCharts(json);
		});

	fetch(`/areas/${region_id}`)
		.then(res => res.json())
		.then(json => {
			while(zoomStack.length > 1){
				zoomStack.pop();
			}
			zoomStack.push({
				data: json,
				bounds: bounds,
			})
			drawAreas(json, bounds);
		});
}

function onAreaClicked(area_id, bounds) {
	fetch(`/area/${area_id}`)
		.then(res => res.json())
		.then(json => {
			while(dataStack.length > 2){
				dataStack.pop();
			}
			dataStack.push(json);
			drawCharts(json);
		});
	fetch(`/meshblocks/${area_id}`)
		.then(res => res.json())
		.then(json => {
			while(zoomStack.length > 2){
				dataStack.pop();
			}
			zoomStack.push({
				data: json,
				bounds: bounds,
			});
			drawMeshblocks(json, bounds);
		});
}

function onMeshblockClicked(meshblock_id, bounds) {
	fetch(`/meshblock/${meshblock_id}`)
		.then(res => res.json())
		.then(json => {
			while(dataStack.length > 2){
				dataStack.pop();
			}
			dataStack.push(json);
			drawCharts(json);
		});
	map.fitBounds(bounds);
}

function getHeatmapColour(value, rangeMin, rangeMax){
	if(value === ''){
		return '#606060';
	}
	const bucketIndex = parseInt(10 * (value - rangeMin) / (rangeMax - rangeMin), 10);
	return colours[bucketIndex];
}

function drawRegions(json, parentBounds){
	layergroup.clearLayers();
	map.fitBounds(parentBounds);
	
	json.forEach(region => 
		drawPolygon(
			layergroup, 
			region, 
			getHeatmapColour(region[heatmapProp], globalMin[heatmapProp], globalMax[heatmapProp]), 
			this.onRegionClicked
		)
	);
	map.removeControl(heatmapLegend);
	map.addControl(heatmapLegend);
};

function drawAreas(json, parentBounds){
	layergroup.clearLayers();
	map.fitBounds(parentBounds);

	json.forEach(area => 
		drawPolygon(
			layergroup, 
			area, 
			getHeatmapColour(area[heatmapProp], globalMin[heatmapProp], globalMax[heatmapProp]), 
			this.onAreaClicked
		)
	);
	map.removeControl(heatmapLegend);
	map.addControl(heatmapLegend);
}

function drawMeshblocks(json, parentBounds){
	layergroup.clearLayers();
	map.fitBounds(parentBounds);

	json.forEach(meshblock => 
		drawPolygon(
			layergroup, 
			meshblock, 
			getHeatmapColour(meshblock[heatmapProp], globalMin[heatmapProp], globalMax[heatmapProp]), 
			this.onMeshblockClicked
		)
	);
	map.removeControl(heatmapLegend);
	map.addControl(heatmapLegend);
}

function decreaseRegionLevel(){
	if(zoomStack.length > 1){
		zoomStack.pop();
	}
	if(dataStack.length > 1){
		dataStack.pop();
	}
	redrawCurrentLevel();
}

function redrawCurrentLevel(){
	switch(zoomStack.length){
		case 1: 
		default:
			drawRegions(zoomStack[0].data, zoomStack[0].bounds);
			break;
		case 2:
			drawAreas(zoomStack[1].data, zoomStack[1].bounds);
			break;
		case 3:
			drawMeshblocks(zoomStack[2].data, zoomStack[2].bounds);
			break;
	}
	switch(dataStack.length){
		case 1: 
		default:
			drawCharts(dataStack[0]);
			break;
		case 2:
			drawCharts(dataStack[1]);
			break;
		case 3:
			drawCharts(dataStack[2]);
			break;
	}
}

function drawCharts(json){
	var header = document.getElementById("chartPanelHeader");

	if (json.region_name == null && dataStack[0].name == json.name){
		header.innerHTML = "";
	}
	else {
		header.innerHTML = json.name;
	}	

	if (json.area_name != null && json.area_name != json.name){
		header.innerHTML = json.area_name + " -> " + header.innerHTML;
	}

	if (json.region_name != null && json.region_name != json.name){
		header.innerHTML = json.region_name + " -> " + header.innerHTML;
	}

	if (json.region_name == null && dataStack[0].name != json.name){
		header.innerHTML = dataStack[0].name + " -> " + header.innerHTML;
	}
	
	header.innerHTML = "<h1> Census Explorer - " + json.name + "</h1>" + header.innerHTML; 

	charts.forEach(chart => {
		$.getScript(chart, function(){
			drawChart(json);
		});
	});
}

fetch('/regions')
	.then(res => res.json())
	.then(json => {
		zoomStack.push({
			data: json,
			bounds: nz_bounds,
		});
		drawRegions(json, nz_bounds);
	});
fetch('/nz')
		.then(res => res.json())
		.then(json => {
			dataStack.push(json);
			drawCharts(json)
		});