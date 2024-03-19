var map = L.map("map").setView([-22.9068, -43.1729], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

fetch(
    "https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=bicycle_parking](around:10000,-22.9068,-43.1729);out;"
  )
    .then((response) => response.json())
    .then((data) => {
      data.elements.forEach((element) => {
        var marker = L.marker([element.lat, element.lon]).addTo(map);
        marker.bindPopup(element.tags.name || "Bicicletário");
      });
    });

function buscarBicicletarios(){
    
}