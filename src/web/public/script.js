// JavaScript文件
let map;
let markers = [];
let currentData = null;

// 初始化Google地图
function initMap() {
	// 中国中心位置
	const chinaCenter = { lat: 35.8617, lng: 104.1954 };

	map = new google.maps.Map(document.getElementById("map"), {
		zoom: 4,
		center: chinaCenter,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		styles: [
			{
				featureType: "water",
				elementType: "geometry",
				stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
			},
			{
				featureType: "landscape",
				elementType: "geometry",
				stylers: [{ color: "#f5f5f5" }, { lightness: 20 }]
			},
			{
				featureType: "road.highway",
				elementType: "geometry.fill",
				stylers: [{ color: "#ffffff" }, { lightness: 17 }]
			},
			{
				featureType: "road.highway",
				elementType: "geometry.stroke",
				stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }]
			},
			{
				featureType: "road.arterial",
				elementType: "geometry",
				stylers: [{ color: "#ffffff" }, { lightness: 18 }]
			},
			{
				featureType: "road.local",
				elementType: "geometry",
				stylers: [{ color: "#ffffff" }, { lightness: 16 }]
			},
			{
				featureType: "poi",
				elementType: "geometry",
				stylers: [{ color: "#f5f5f5" }, { lightness: 21 }]
			},
			{
				featureType: "poi.park",
				elementType: "geometry",
				stylers: [{ color: "#dedede" }, { lightness: 21 }]
			},
			{
				elementType: "labels.text.stroke",
				stylers: [{ visibility: "on" }, { color: "#ffffff" }, { lightness: 16 }]
			},
			{
				elementType: "labels.text.fill",
				stylers: [{ saturation: 36 }, { color: "#333333" }, { lightness: 40 }]
			},
			{
				elementType: "labels.icon",
				stylers: [{ visibility: "off" }]
			},
			{
				featureType: "transit",
				elementType: "geometry",
				stylers: [{ color: "#f2f2f2" }, { lightness: 19 }]
			},
			{
				featureType: "administrative",
				elementType: "geometry.fill",
				stylers: [{ color: "#fefefe" }, { lightness: 20 }]
			},
			{
				featureType: "administrative",
				elementType: "geometry.stroke",
				stylers: [{ color: "#fefefe" }, { lightness: 17 }, { weight: 1.2 }]
			}
		]
	});
}

// 加载数据
async function loadData(file) {
	try {
		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch("/api/map-data", {
			method: "POST",
			body: formData
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		currentData = data;
		updateStats(data.summary);
		addMarkersToMap(data.markers);
	} catch (error) {
		showError("加载数据失败: " + error.message);
	}
}

// 更新统计信息
function updateStats(summary) {
	document.getElementById("totalIps").textContent = summary.totalIps;
	document.getElementById("totalRequests").textContent = summary.totalRequests;
	document.getElementById("totalRegions").textContent = summary.regions;
}

// 在地图上添加标记
function addMarkersToMap(markersData) {
	// 清除现有标记
	clearMarkers();

	const bounds = new google.maps.LatLngBounds();

	markersData.forEach((markerData) => {
		const position = { lat: markerData.lat, lng: markerData.lng };

		// 根据请求数量设置标记大小和颜色
		const markerSize = Math.min(Math.max(markerData.count / 10, 8), 30);
		const markerColor = markerData.count > 50 ? "#ff4444" : markerData.count > 20 ? "#ff8800" : "#4488ff";

		const marker = new google.maps.Marker({
			position: position,
			map: map,
			title: markerData.title,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: markerSize,
				fillColor: markerColor,
				fillOpacity: 0.8,
				strokeColor: "#ffffff",
				strokeWeight: 2
			}
		});

		// 创建信息窗口
		const infoWindow = new google.maps.InfoWindow({
			content: `
				<div class="marker-popup">
					<h4>${markerData.title}</h4>
					<p>${markerData.description}</p>
					<p><strong>请求次数:</strong> ${markerData.count}</p>
				</div>
			`
		});

		// 添加点击事件
		marker.addListener("click", function () {
			infoWindow.open(map, marker);
			showIpDetails(markerData);
		});

		markers.push(marker);
		bounds.extend(position);
	});

	// 调整地图视图以显示所有标记
	if (markers.length > 0) {
		map.fitBounds(bounds);
	}
}

// 清除标记
function clearMarkers() {
	markers.forEach((marker) => {
		marker.setMap(null);
	});
	markers = [];
}

// 显示IP详情
function showIpDetails(markerData) {
	const detailsContainer = document.getElementById("ipDetails");

	// 这里可以根据需要显示更详细的IP信息
	detailsContainer.innerHTML = `
        <div class="ip-detail-item">
            <strong>区域:</strong> ${markerData.country} - ${markerData.region}<br>
            <strong>坐标:</strong> ${markerData.lat.toFixed(4)}, ${markerData.lng.toFixed(4)}<br>
            <strong>请求次数:</strong> ${markerData.count}
        </div>
    `;
}

// 显示错误信息
function showError(message) {
	const detailsContainer = document.getElementById("ipDetails");
	detailsContainer.innerHTML = `<div class="error">${message}</div>`;
}

// 清除数据
function clearData() {
	clearMarkers();
	currentData = null;

	document.getElementById("totalIps").textContent = "0";
	document.getElementById("totalRequests").textContent = "0";
	document.getElementById("totalRegions").textContent = "0";

	document.getElementById("ipDetails").innerHTML = "";
}

// 事件监听器
document.addEventListener("DOMContentLoaded", function () {
	// initMap 将由 Google Maps API 回调函数调用

	const fileInput = document.getElementById("fileInput");
	const loadBtn = document.getElementById("loadBtn");
	const clearBtn = document.getElementById("clearBtn");

	loadBtn.addEventListener("click", function () {
		const file = fileInput.files[0];
		if (file) {
			loadData(file);
		} else {
			showError("请选择一个文件");
		}
	});

	clearBtn.addEventListener("click", clearData);

	// 支持拖拽上传
	const mapContainer = document.getElementById("map");
	mapContainer.addEventListener("dragover", function (e) {
		e.preventDefault();
		mapContainer.style.backgroundColor = "#f0f8ff";
	});

	mapContainer.addEventListener("dragleave", function (e) {
		e.preventDefault();
		mapContainer.style.backgroundColor = "";
	});

	mapContainer.addEventListener("drop", function (e) {
		e.preventDefault();
		mapContainer.style.backgroundColor = "";

		const files = e.dataTransfer.files;
		if (files.length > 0) {
			fileInput.files = files;
			loadData(files[0]);
		}
	});
});
