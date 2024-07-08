
mapboxgl.accessToken = mapToken ; 
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: l.geometry.coordinates,
    zoom: 9 
});


const marker = new mapboxgl.Marker({
    color : "red" , 
    offset: [0, -25]
})
.setLngLat(l.geometry.coordinates) 
.setPopup(new mapboxgl.Popup({offset: 25})
.setHTML(
    `<p>Exact location provided after booking</p>`
))
.addTo(map);