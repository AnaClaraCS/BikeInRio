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
    var qtdBicicletarios = document.getElementById("qtd-bicicletarios").value;

    localizarEndereco().then(function(localBuscado) {
        console.log("Local buscado: " + localBuscado); 
        procuraBicicletariosProximos(localBuscado);
    });

    
    
}

function localizarEndereco(){
    var enderecoBuscado = document.getElementById("campo-busca").value;

    // define um contexto para as pesquisas serem limitadas ao rio de janeiro
    const contextoRJ = "&countrycodes=BR&bounded=1&viewbox=-43.795496,-23.083396,-43.096150,-22.732853";
    
    // promisse porque retornar antes de fazer a consulta na api
    return new Promise(function(resolve) {
        fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + enderecoBuscado + contextoRJ)
            .then((response) => response.json())
            .then((data) => {
                if (data.length > 0) {
                    //data é uma matriz com varias localizações
                    resolve(data[0].lat + "," + data[0].lon);
                }
            });
    });

}

function procuraBicicletariosProximos(localBuscado){
    return new Promise(function(resolve){
        fetch(
            "https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=bicycle_parking](around:1000," +
            localBuscado +
            ");out;"
        )
            .then((response) => response.json())
            .then((data) => {
                document.getElementById("lista-bicicletarios").innerHTML = "";

                data.elements.forEach((element) => {
                    var nome = element.tags.name || "Bicicletário";

                    var bicicletarioLatLng = L.latLng(element.lat, element.lon);
                    var localBuscadoLatLng = L.latLng(localBuscado.split(",")[0], localBuscado.split(",")[1]);
                    var distancia = localBuscadoLatLng.distanceTo(bicicletarioLatLng) / 1000;


                    var listItem = document.createElement("li");
                    listItem.textContent = nome + " - " + distancia + " km"; 
                    
                    document.getElementById("lista-bicicletarios").appendChild(listItem);
                });
            });
    });

}