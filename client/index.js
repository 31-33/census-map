var map = L.map('map');
const nz_bounds = [[-33.87, 164.36], [-48.17, 179.30]];
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', 
	{
		foo: 'bar', 
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	}).addTo(map);

map.fitBounds(nz_bounds);

let layergroup = L.layerGroup().addTo(map);

function drawPolygon(layergroup, coords, callback) {
	const wkt = new Wkt.Wkt();
	wkt.read(coords);
	layergroup.addLayer(
		wkt.toObject({
			color: 'red',
		}).on('click', () => callback(0))
	);
}

function onRegionClicked(region_id) {
	console.log(`User clicked region: ${region_id}`);
	// TODO: fetch data for {region_id}

	layergroup.clearLayers();
	// TODO: fetch areas with {region_id} and draw on map
}

function onAreaClicked(area_id) {
	console.log(`User clicked area: ${area_id}`);
	// TODO: fetch data for {area_id}

	layergroup.clearLayers();
	// TODO: fetch meshblocks with {area_id} and draw on map
}

function onMeshblockClicked(meshblock_id) {
	console.log(`User clicked meshblock: ${meshblock_id}`);

	layergroup.clearLayers();
	// TODO: fetch data for {meshblock_id}
}

let test_region = "MULTIPOLYGON (((168 -50, 170 -40, 176 -30)))";
drawPolygon(layergroup, test_region, this.onRegionClicked);
