const stores = JSON.parse(document.getElementById('stores-data').textContent);
console.log('Stores data:', stores);

function initMap() {
    console.log('Initializing map...');
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: { lat: 35.6895, lng: 139.6917 }
    });

    console.log('Map initialized');

    stores.forEach(store => {
        console.log(`Processing store: ${store.name}, Coordinates: (${store.latitude}, ${store.longitude})`);
        if (store.latitude && store.longitude) {
            const marker = new google.maps.Marker({
                position: { lat: store.latitude, lng: store.longitude },
                map: map,
                title: store.name
            });
            console.log(`Marker added for store: ${store.name}`);
        } else {
            console.error(`Invalid coordinates for store: ${store.name}`);
        }
    });
}

window.onload = initMap;
