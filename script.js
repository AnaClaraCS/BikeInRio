var map = L.map("map").setView([-22.9068, -43.1729], 13);

//icone personalizado os bicicletarios
var iconeBicicletario = L.icon({
    iconUrl: 'iconeBicicletario.png',
    iconSize:     [50, 50], // size of the icon
    iconAnchor:   [25, 25], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// marca todos os bicicletários no mapa
// fetch(
//     "https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=bicycle_parking](around:10000,-22.9068,-43.1729);out;"
//   )
//     .then((response) => response.json())
//     .then((data) => {
//       data.elements.forEach((element) => {
//         var marker = L.marker([element.lat, element.lon]).addTo(map);
//         marker.bindPopup(element.tags.name || "Bicicletário");
//       });
//     });

function buscarBicicletarios(){
    localizarEndereco().then(function(localBuscado) { // primeiro encontra as coordenada do lugar pesquisado
        console.log("Local buscado: " + localBuscado); 
        procuraBicicletariosProximos(localBuscado).then(function(bicicletarios){ // segundo - procura os bicicletarios proximos (10km)
            exibeBicicletarios(bicicletarios); //terceiro - exibe a quantidade selecionada
        });
    });  
}

// Marca o lugar pesquisado no mapa, centraliza nesse lugar e retorna as coordenadas em forma de String
function localizarEndereco(){
    var enderecoBuscado = document.getElementById("campo-busca").value;

    // define um contexto para as pesquisas serem limitadas ao rio de janeiro
    const contextoRJ = "&countrycodes=BR&bounded=1&viewbox=-43.795496,-23.083396,-43.096150,-22.732853";
    
    // promisse porque retorna antes de fazer a consulta na api
    return new Promise(function(resolve) {
        // API que busca o nome e retornar latitude e longitude
        fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + enderecoBuscado + contextoRJ)
            .then((response) => response.json())
            .then((data) => {
                if (data.length > 0) {
                    //data é uma matriz com varias localizações que corresponde a busca
                    var latitude = data[0].lat;
                    var longitude = data[0].lon;
                    //Centralizando mapa no local pesquisado e adicionando marker
                    map.setView([latitude, longitude], 16);
                    var marker = L.marker([latitude, longitude]).addTo(map);
                    marker.bindPopup("Seu local");
                    //Retornando o local para outras consultas
                    resolve(latitude + "," + longitude);
                }
            });
    });
}

//Procura os bicicletarios proximos (limite de 10km)
function procuraBicicletariosProximos(localBuscado){
    return new Promise(function(resolve){
        // API que busca nos proximos ao local fornecido (apenas consumo de dados)
        //node[amenity=bicycle_parking] = bicicletarios
        // around:10000 especifica um raio de busca de 10km
        fetch(
            "https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=bicycle_parking](around:10000," + localBuscado + ");out;"
        )
            .then((response) => response.json())
            .then((data) => {
                document.getElementById("lista-bicicletarios").innerHTML = "";

                var bicicletarios = [];
                data.elements.forEach((element) => {
                    var nome = element.tags.name || "Bicicletário";
                    var distancia = calcDistancia(element.lat, element.lon, localBuscado); 
                    bicicletarios.push({nome: nome, latitude: element.lat, longitude: element.lon, distancia: distancia});
                });

                // Ordena de forma crescente pela distancia
                bicicletarios.sort((a, b) => a.distancia - b.distancia);
                
                // Seleciono só a quantidade solicitada
                var qtdBicicletarios = document.getElementById("qtd-bicicletarios").value;
                bicicletarios = bicicletarios.slice(0, qtdBicicletarios);

                //Retorno o array
                resolve(bicicletarios);
            });
    });

}

//Calcula a distancia em metros entre dois pontos usando latitude e longitude
//os primeiros parametros são do bicicletario e o ultimo sobre o ponto de referencia
function calcDistancia(latitude, longitude, localBuscado){
    var bicicletario = L.latLng(latitude, longitude);
    var referencia = L.latLng(localBuscado.split(",")[0], localBuscado.split(",")[1]);
    //Retorna a distancia em metros
    return referencia.distanceTo(bicicletario);
}

// Exibe os bicicletarios mais proximos (quantidade solicitada) tanto no mapa quanto no HTML
function exibeBicicletarios(bicicletarios){
    document.getElementById("lista-bicicletarios").innerHTML = "";

    bicicletarios.forEach(function(bicicletario){
        //Exibe no HTML
        var itemLista = document.createElement("li");
        itemLista.textContent = bicicletario.nome + " - "; 
        if(bicicletario.distancia > 1000){
            itemLista.textContent += (bicicletario.distancia/1000).toFixed(3) + " km";
        }
        else{
            itemLista.textContent += (bicicletario.distancia).toFixed(0) + " m";
        }
        document.getElementById("lista-bicicletarios").appendChild(itemLista);
        // Exibe no mapa
        var marker = L.marker([bicicletario.latitude, bicicletario.longitude], {icon: iconeBicicletario}).addTo(map);
        marker.bindPopup(bicicletario.nome);
    });
    
}
