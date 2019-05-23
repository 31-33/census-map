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

var zoomStack = [];

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
		polygon.on('click', () => callback(data.id, polygon._bounds))
	);
}

function onRegionClicked(region_id, bounds) {
	fetch(`/region/${region_id}`)
		.then(res => res.json())
		.then(json => drawCharts(json));

	fetch(`/areas/${region_id}`)
		.then(res => res.json())
		.then(json => {
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
		.then(json => drawCharts(json));

	fetch(`/meshblocks/${area_id}`)
		.then(res => res.json())
		.then(json => {
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
		.then(json => drawCharts(json));
	map.fitBounds(bounds);
}

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
}

function decreaseRegionLevel(){
	if(zoomStack.length > 1){
		zoomStack.pop();
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
}

function drawCharts(json){
	$.getScript("chart1.js", function(){
		drawChart(json);
	});
	
	$.getScript("chart2.js", function(){
		drawChart(json);
	});
	
	$.getScript("chart3.js", function(){
		drawChart(json);
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
		.then(json => drawCharts(json));