class DroneMap {
	constructor({ defaultLocation = [], zoomLevel = 19, droneIcon }) {
		this.currentLocation = defaultLocation;
		this.currentLocationArray = [this.currentLocation.lat, this.currentLocation.lng];
		this.zoomLevel = zoomLevel;
		this.droneIcon = droneIcon;
		this.droneMarker = null;
	}
	initMap() {
		console.log('initMap');
		this.map = L.map('map').setView(this.currentLocationArray, this.zoomLevel);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(this.map);
		this.polyline = L.polyline([], { color: 'blue' }).addTo(this.map);
	}
	updateDroneLocation(currentLocation) {
		if (!this.droneMarker) {
			this.droneMarker = L.marker(this.currentLocationArray, { icon: this.droneIcon ? this.droneIcon : null }).addTo(
				this.map
			);
		}
		this.currentLocation = currentLocation;
		this.currentLocationArray = [this.currentLocation?.lat, this.currentLocation?.lng];
		this.droneMarker.setLatLng(this.currentLocationArray);
		this.map.panTo(this.currentLocationArray);
		this.polyline.addLatLng(currentLocation);
	}
	getCurrentLocation() {
		return this.currentLocation;
	}
}
