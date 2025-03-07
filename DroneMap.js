class DroneMap {
	constructor({ defaultLocation = {}, zoomLevel = 19, droneIcon, onClickMap, onGetSpeedHeight }) {
		this.currentLocation = defaultLocation;
		this.zoomLevel = zoomLevel;
		this.droneIcon = droneIcon;
		this.droneMarker = null;
		this.focusMode = true;
		this.settingMode = false;
		this.routePoints = [];
		this.droneLayerGroup = null;
		this.routeLayerGroup = null;
		this.routeNumber = 1;
		this.onClickMap = onClickMap;
		this.mapData = [];
		this.onGetSpeedHeight = onGetSpeedHeight;
		this.initMap();
	}
	initMap() {
		this.map = L.map('map').setView(this.currentLocation, this.zoomLevel);
		this.map.on('click', (e) => this.addMarkerToRoute(e));
		this.droneLayerGroup = L.layerGroup().addTo(this.map);
		this.routeLayerGroup = L.layerGroup().addTo(this.map);
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(this.map);

		this.dronePolyline = L.polyline([], { color: 'blue' }).addTo(this.droneLayerGroup);
		this.routePolyline = L.polyline([], { color: 'red', weight: 3, opacity: 0.7, dashArray: '10, 10' }).addTo(
			this.routeLayerGroup
		);
		//Test data, remove when release
		// setInterval(() => {
		// 	if (!this.settingMode) {
		// 		this.updateDroneLocation(this.getRandomLatLng());
		// 	}
		// }, 1000);

		this.grid = new gridjs.Grid({
			columns: ['ID', 'Lat', 'Lng', 'Speed', 'Height'],
			data: [],
			pagination: {
				limit: 5,
				summary: false,
				nextButton: false,
				prevButton: false,
			},
			resizable: true,
			sort: true,
			width: '100%',
		}).render(document.getElementById('routeTable'));
	}
	updateDroneLocation(currentLocation) {
		if (this.settingMode) {
			return;
		}
		this.currentLocation = currentLocation;

		if (!this.droneMarker) {
			this.droneMarker = L.marker(this.currentLocation, {
				icon: this.droneIcon ? this.droneIcon : null,
			}).addTo(this.droneLayerGroup);
		} else {
			this.droneMarker.setLatLng(this.currentLocation);
		}
		this.dronePolyline.addLatLng(currentLocation);
		if (this.focusMode) {
			this.map.panTo(this.currentLocation);
		}
	}
	getCurrentLocation() {
		return this.currentLocation;
	}
	setFocusMode(focusMode) {
		this.focusMode = focusMode;
	}
	goToSettingMode() {
		this.settingMode = true;
		this.clearDroneLayerGroup();
	}
	clearDroneLayerGroup() {
		if (this.droneLayerGroup) {
			this.droneLayerGroup.clearLayers();
		}
	}
	getRandomLatLng() {
		let stepSize = 0.00045;
		let angle = Math.random() * 2 * Math.PI;
		return {
			lat: this.currentLocation.lat + stepSize * Math.cos(angle),
			lng: this.currentLocation.lng + stepSize * Math.sin(angle),
		};
	}
	getRouteMarkerIconNumber() {
		return L.ExtraMarkers.icon({
			icon: 'fa-number',
			markerColor: 'blue-dark',
			shape: 'circle',
			prefix: 'fa',
			number: this.routeNumber++,
		});
	}
	addMarkerToRoute(e) {
		if (!this.settingMode) {
			return;
		}

		let height = 0;
		let speed = 0;
		if (this.onGetSpeedHeight) {
			[speed, height] = this.onGetSpeedHeight();
		}
		if (!speed || !height) {
			alert('Please enter speed and height');
			return;
		}

		const marker = L.marker(e.latlng, {
			icon: this.getRouteMarkerIconNumber(),
			draggable: true,
		}).addTo(this.routeLayerGroup);

		this.routePolyline.addLatLng(e.latlng);

		this.routePoints.push({ lat: e.latlng.lat.toFixed(6), lng: e.latlng.lng.toFixed(6), speed, height });

		const index = this.routePoints.length - 1;
		this.updateDataGrid();
		/* Update polyline when marker is dragged */
		marker.on('dragend', (event) => {
			const newLatLng = event.target.getLatLng();
			this.routePoints[index] = { lat: newLatLng.lat.toFixed(6), lng: newLatLng.lng.toFixed(6), speed, height };
			this.routePolyline.setLatLngs(this.routePoints);
			this.updateDataGrid();
		});
	}
	updateDataGrid() {
		this.grid
			.updateConfig({
				data: this.routePoints.map((point, index) => [index + 1, point.lat, point.lng, point.speed, point.height]),
			})
			.forceRender();
	}
	clearAllMarkers() {
		if (this.routeLayerGroup) {
			this.routeLayerGroup.clearLayers();
			this.updateDataGrid([]);
			this.routeNumber = 1;
			this.routePoints = [];
			this.routePolyline = L.polyline([], { color: 'red', weight: 3, opacity: 0.7, dashArray: '10, 10' }).addTo(
				this.routeLayerGroup
			);
		}
	}
	searchLocation(lat, lng) {
		this.map.panTo({ lat: lat, lng: lng });
		this.map.setZoom(25);
	}
	getRoutePoints() {
		return this.routePoints;
	}
}
