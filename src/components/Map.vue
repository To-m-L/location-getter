<template>
  <div>
    <h1 class="titleText">CityClock: Worldwide Time Tracker</h1>
  </div>
  <div class="container">
    <input class="autoCompleteBox" placeholder=" Location" ref="locationInput"/>
    <br>
    <VBtn variant="outlined" @click="showUserLocation">Show My Location</VBtn>
  </div>
  <div class="map-container">
      <div id="map"></div>
  </div>
  <div class="dataContainer">
    <v-data-table
      v-model="selectedItems"
      :items="datamarkers"
      :headers="headers"
      :items-per-page="10"
      return-object
      show-select
      @input="onItemSelect()"
    >
    </v-data-table>
  </div>
  <div class="delete-button-container">
  <v-btn @click="deleteSelectedItems" class="delete-button" :disabled="selectedItems.length === 0">
            Delete Selected Items
  </v-btn>
  </div>
  

</template>

<script>
//Background color rgb (70, 73, 86)

import { VBtn} from 'vuetify/lib/components';
import {VDataTable} from 'vuetify/lib/labs/VDataTable';

export default {
  components:{
    VBtn,
    VDataTable,
  },
  methods: {
    showUserLocation() {
      if (!window.google) {
        console.error('Google Maps API not loaded');
        return;
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.displayUserLocation, this.handleLocationError);
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    },
    displayUserLocation(position) {
      if (!window.google) {
        console.error('Google Maps API not loaded');
        return;
      }

      const userLocation = new window.google.maps.LatLng(
        position ? position.coords.latitude : 37.7749,
        position ? position.coords.longitude : -122.4194
      );

      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: userLocation,
        zoom: 15
      });

      map.panTo(userLocation);

      if (this.markers && this.markers.length > 0) {
          this.markers.forEach(marker => {
          marker.setMap(map);
      });
  }

    },
    handleLocationError(error) {
      if (!window.google) {
        console.error('Google Maps API not loaded');
        return;
      }

      switch(error.code) {
        case error.PERMISSION_DENIED:
          alert("User denied the request for geolocation.");
          break;
        case error.POSITION_UNAVAILABLE:
          alert("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          alert("The request to get user location timed out.");
          break;
        case error.UNKNOWN_ERROR:
          alert("An unknown error occurred.");
          break;
        default:
          alert("An unknown error occurred.");
      }
    },
    setupAutocomplete() {
      const inputElement = this.$refs.locationInput;
      const autocomplete = new window.google.maps.places.Autocomplete(inputElement);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        // Handle the selected place (e.g., save to a variable, show details, etc.)
        this.selectPrediction(place);
        console.log('Selected Place:', place);
      });

      autocomplete.addListener('predictions_changed', () => {
        this.predictions = autocomplete.getPlacePredictions() || [];
      });
    },
    selectPrediction(prediction) {
      console.log("Select Prediction Called");
      console.log("Place's Formatted Address: ");
      console.log(prediction.formatted_address);
      
      const inputElement = this.$refs.locationInput;
      inputElement.value = "";
      this.predictions = [];

      //------Placing Marker on map----//

      if (window.google) {
        const service = new window.google.maps.places.PlacesService(document.getElementById("map"));
        service.getDetails(
          {
            placeId: prediction.place_id
          },
          (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              const selectedLocation = new window.google.maps.LatLng(
                place.geometry.location.lat(),
                place.geometry.location.lng()
              );

            const map = new window.google.maps.Map(document.getElementById("map"), {
              center: selectedLocation,
              zoom: 15
            });

            const marker = new window.google.maps.Marker({
              position: selectedLocation,
              map: map,
              title: place.name
            });

          // Ensure markers is initialized
            if (!this.markers) {
              this.markers = [];
            }

            marker.address = prediction.formatted_address;
            this.markers.push(marker);
            console.log(this.markers);

          // Adding to array for use in Data Table
            if(!this.datamarkers){
              this.datamarkers=[];
            }

            this.getTimezoneInfo(selectedLocation, (timezone, localTime) => {
            // Update data with timezone and local time
            this.datamarkers.push({
              title: marker.title,
              timezone: timezone,
              localTime: localTime,
              address: prediction.formatted_address,
              selected: ""
            });})

            console.log(this.datamarkers);

          // Clear previous markers
            this.markers.forEach(marker => {
              marker.setMap(map);
            });
          } else {
            console.error('Error fetching place details:', status);
          }
        }
      );
    }
      

    },   

    //------------ Deleting Item(s) From Table
    
    deleteSelectedItems() {

    // Remove selected items from datamarkers based on their titles
    let selectedItemTitles = this.selectedItems.map(item => item.address);
    for(let i=0;i<this.datamarkers.length;i++){
      if(selectedItemTitles.includes(this.datamarkers[i].address)){
        this.datamarkers.splice(i, 1);
        i--;
      }
    }

    // Iterate through the markers to remove the ones associated with the selected items
    for (let i = 0; i < this.markers.length; i++) {
    if (selectedItemTitles.includes(this.markers[i].address)) {
      this.markers[i].setMap(null);  // Remove marker from the map
      this.markers.splice(i, 1);  // Remove marker from the array
      i--;  // Decrement i to handle removal without skipping elements
    }
  }

    this.selectedItems = [];  // Clear the selected items
    },


    onItemSelect(){

      console.log(this.selectedItems);

      // Update the 'selected' attribute of the corresponding datamarkers
      this.datamarkers.forEach(marker => {
        marker.selected = this.selectedItems.some(selectedItem => selectedItem.address === marker.address) ? '✔' : '';
      });
    },

    // Gets the Timezone
    getTimezoneInfo(location, callback) {
    const apiUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${location.lat()},${location.lng()}&timestamp=${Math.floor(Date.now() / 1000)}&key=AIzaSyDaxb1pole_WmObrtDg4C-diHCPuyaAmZU`;

    // Make the API request
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'OK') {
          const timezone = data.timeZoneId;
          const localTime = new Date().toLocaleString('en-US', { timeZone: timezone });
          callback(timezone, localTime);
        } else {
          console.error('Error fetching timezone information:', data.status);
          callback(null, null);
        }
      })
      .catch(error => {
        console.error('Error fetching timezone information:', error);
        callback(null, null);
      });
    }


  },

  mounted() {
    this.showUserLocation();
    this.setupAutocomplete();
  },

  data() {
  return {
    datamarkers: [], // Initialize as an empty array
    headers: [
      { title: "Location Title", key:'title'},
      { title: 'Address', key: 'address'},
      { title: 'Timezone', key: 'timezone' },
      { title: 'Local Time', key: 'localTime' },
      {title: "", key: "selected"}
    ],
    selectedItems: [] // Store selected items
  };
},

};
</script>

<style>

.titleText{

  text-align: center;
  font-weight: lighter;

}

.autoCompleteBox{

  width:25%;
  height:35px;
  border: 1px solid black;

}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 18vh;
}

.map-container {
  display: flex;
  justify-content: center;
}

#map {
  width: 100%; /* Adjust as needed */
  height: 500px; /* Adjust as needed */
}
.delete-button-container{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

}
.v-selection-control{

  border-radius: 25px;
  background: lightblue;
}
</style>
