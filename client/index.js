var map = L.map('map');
const nz_bounds = [[-33.87, 164.36], [-48.17, 179.30]];
var previousID = null;
var previousBounds = null;
const layerState = {
	REGION: 'region',
	AREA: 'area',
	MESHBLOCK: 'meshblock'
}
let state = layerState.REGION;

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

let layergroup = L.layerGroup().addTo(map);
const wkt = new Wkt.Wkt();

function drawPolygon(layergroup, data, color, callback) {
	wkt.read(data.wkt);
	const polygon = wkt.toObject({
		color: color,
	});
	layergroup.addLayer(
		polygon.on('click', () => callback(data.id, polygon._bounds))
	);
}

function onRegionClicked(region_id, bounds) {
	console.log(`User clicked region: ${region_id}`);
	// TODO: fetch data for {region_id}
	
	drawCharts();
	map.fitBounds(bounds);
	layergroup.clearLayers();
	drawAreas(region_id);
	previousID = region_id;
	previousBounds = bounds;
	state = layerState.AREA;
}

function onAreaClicked(area_id, bounds) {
	console.log(`User clicked area: ${area_id}`);
	// TODO: fetch data for {area_id}

	drawCharts();
	map.fitBounds(bounds);
	layergroup.clearLayers();
	drawMeshblocks(area_id);
	state = layerState.MESHBLOCK
}

function onMeshblockClicked(meshblock_id, bounds) {
	console.log(`User clicked meshblock: ${meshblock_id}`);
	// TODO: fetch data for {meshblock_id}
	
	drawCharts();
	map.fitBounds(bounds);
}

function drawRegions(){
	map.fitBounds(nz_bounds);
	layergroup.clearLayers();
	state = layerState.REGION;
	fetch('/regions')
		.then(res => res.json())
		.then(json => json.forEach(region => {
			drawPolygon(layergroup, region, 'red', this.onRegionClicked);
		}));
};

function drawAreas(region_id){
	fetch(`/areas/${region_id}`)
		.then(res => res.json())
		.then(json => json.forEach(area => {
			drawPolygon(layergroup, area, 'yellow', this.onAreaClicked);
		}));
}

function drawMeshblocks(area_id){
	fetch(`/meshblocks/${area_id}`)
		.then(res => res.json())
		.then(json => json.forEach(meshblock => {
			drawPolygon(layergroup, meshblock, 'green', this.onMeshblockClicked);
		}));
}

function decreaseRegionLevel(){
	console.log("Decrease - " + previousID);
	
	if (state == layerState.REGION){
		previousID = null;
		previousBounds = nz_bounds;
	}
	else if (state == layerState.AREA){
		drawRegions();
		drawCharts();
	}
	else if (state == layerState.MESHBLOCK){
		onRegionClicked(previousID, previousBounds);
	}
}

// TODO: remove fetch(NZ) hardcoding
function drawCharts(){
	var json = fetch('/nz').then(res => res.json());
	
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

drawRegions();
drawCharts();





