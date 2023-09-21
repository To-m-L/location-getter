<template>
  <div class="center-container">
    <button @click="showUserLocation">Show My Location</button>
  </div>
  <div class="map-container">
    <div id="map"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      googleMap: null,
      googleMarker: null
    };
  },
  methods: {
    showUserLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.displayUserLocation, this.handleLocationError);
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    },
    displayUserLocation(position) {
      const { latitude, longitude } = position.coords;
      const userLocation = new this.google.maps.LatLng(latitude, longitude);

      this.googleMap = new this.google.maps.Map(document.getElementById("map"), {
        center: userLocation,
        zoom: 15
      });

      this.googleMarker = new this.google.maps.Marker({
        position: userLocation,
        map: this.googleMap,
        title: "Your Location"
      });
    }
  },
  mounted() {
    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=API Key`;
    script.defer = true;
    script.async = true;
    script.onload = () => {
      // Once the Google Maps API is loaded, we can use the `google` object
      this.google = window.google;
      this.displayUserLocation();  // Optional: display user location immediately
    };
    document.head.appendChild(script);
  }
};
</script>

<style scoped>
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin-bottom: 0px; /* Optional: Add margin below the button */
}

.map-container {
  display: flex;
  justify-content: center;
  margin-top: 5px;
}

#map {
  width: 80%; /* Adjust as needed */
  height: 400px; /* Adjust as needed */
}
</style>