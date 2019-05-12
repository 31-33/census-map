var map = L.map('map');
const nz_bounds = [[-33.87, 164.36], [-48.17, 179.30]];
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', 
	{
		foo: 'bar', 
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	}).addTo(map);

map.fitBounds(nz_bounds);

let layergroup = L.layerGroup().addTo(map);

function drawPolygon(layergroup, coords, id, callback) {
	const wkt = new Wkt.Wkt();
	wkt.read(coords);
	layergroup.addLayer(
		wkt.toObject({
			color: 'red',
		}).on('click', () => callback(id))
	);
}

function onRegionClicked(region_id) {
	console.log(`User clicked region: ${region_id}`);
	// TODO: fetch data for {region_id}

	layergroup.clearLayers();
	drawAreas(region_id);
}

function onAreaClicked(area_id) {
	console.log(`User clicked area: ${area_id}`);
	// TODO: fetch data for {area_id}

	layergroup.clearLayers();
	drawMeshblocks(area_id);
}

function onMeshblockClicked(meshblock_id) {
	console.log(`User clicked meshblock: ${meshblock_id}`);

	// layergroup.clearLayers();
	// TODO: fetch data for {meshblock_id}
}

function drawRegions(){
	fetch('/regions')
		.then(res => res.json())
		.then(json => json.forEach(region => {
			drawPolygon(layergroup, region.wkt, region.id, this.onRegionClicked);
		}));
};

function drawAreas(region_id){
	fetch(`/areas/${region_id}`)
		.then(res => res.json())
		.then(json => json.forEach(area => {
			drawPolygon(layergroup, area.wkt, area.id, this.onAreaClicked);
		}));
}

function drawMeshblocks(area_id){
	fetch(`/meshblocks/${area_id}`)
		.then(res => res.json())
		.then(json => json.forEach(meshblock => {
			drawPolygon(layergroup, meshblock.wkt, meshblock.id, this.onMeshblockClicked);
		}));
}

drawRegions();