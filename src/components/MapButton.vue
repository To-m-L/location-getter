<template>
  <button @click="showUserLocation">Show My Location</button>
  <div id="map" style="width: 100%; height: 400px;"></div>
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDaxb1pole_WmObrtDg4C-diHCPuyaAmZU`;
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
/* Add your custom styles for the button if needed */
</style>