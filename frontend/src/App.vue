<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import { isMap } from '@vue/shared';

let word = ref("");
let wordArray;
let letter = ref("");
let points = ref(0);
let currentAt = 0;
const video = ref(null);
const canvas = ref(null);
let stream = null;


function FindLargest(data){
  let maxLabel = null;
  let maxAccuracy = -1;
  for (const result of data){
    if (result.value > maxAccuracy){
      maxAccuracy = result.value;
      maxLabel = result.label;
    }
  }
  return maxLabel;
}



// Update the word function - call it when the user have guessed one full word correctly
function updateWord() {
 axios.get("https://random-word-api.herokuapp.com/word")
   .then(response => {
     word.value = response.data[0].toUpperCase();
     console.log(word.value);
     wordArray = word.value.split('');
     console.log(wordArray);
   })
   .catch(error => {
     console.error("Error fetching word:", error);
   });
}




function Classify(rawFeatures) {
 axios.post('http://localhost:8080/api', {
   userInput: rawFeatures
 })
 .then(response => {
   let classifiedResult = JSON.parse(response.data.final); 
   console.log(classifiedResult['results']);
   const maxLabel = FindLargest(classifiedResult['results']);
   console.log(maxLabel);
   if (maxLabel == wordArray[currentAt]){
     currentAt++;
     points.value++;
     if(currentAt == wordArray.length){
       updateWord();
       currentAt = 0;
     }
   }
   
 })
 .catch(error => {
   console.error('Classification error:', error);
 });
}


updateWord();

// wordArray = word.value.split('');
// console.log(wordArray)

// Function to capture a photo every two seconds
function capturePhoto() {
 setInterval(() => {
   var photo=document.getElementById("photo");
   const canvasElement = document.getElementById('img');
   const context = canvasElement.getContext('2d');
   context.canvas.willReadFrequently = true;
   canvasElement.width = 96;
   canvasElement.height = 96;
   
   //show photos every 2 sec
   context.drawImage(photo, 0, 0, canvasElement.width, canvasElement.height);

   const imageData = context.getImageData(0,0,canvasElement.width, canvasElement.height);
   const data = imageData.data;
   

   var features = [];
   var strHex;
   for (let i = 0;i < data.length; i += 4) {
     strHex='0x';
     for (var j = 0; j < 3; j++) {
       var hex = Number(data[i+j]).toString(16);
       if (hex === "0") {
         hex += hex;
       }
       strHex += hex;
     }
     features.push(strHex);
   }
   console.log(features);
   let rawFe = features.join(', ')
   console.log(rawFe)
   Classify(rawFe);
 }, 2000);
}

// Hook to start capturing photos when the component is mounted
onMounted(() => {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((mediaStream) => {
      video.value.srcObject = mediaStream;
      stream = mediaStream;
      capturePhoto(); // Start capturing photos every two seconds
    })
    .catch((error) => {
      console.error('Error accessing camera:', error);
    });
});

// Hook to stop capturing photos when the component is unmounted
onBeforeUnmount(() => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
});


</script>

<template>
  <div>
    <div id="title">ASL Spelling Game</div>
    <div class="frame">
      <div id="title">Word: {{ word }}</div>
      <div>
        
        <canvas id="img" hidden="true"></canvas>
        
        <div id="letter">{{ wordArray[currentAt] }}</div>
        <video id="photo" ref="video" autoplay></video>
      </div>
    </div>

    <h2>Current Points: {{points}}</h2>
  </div>
</template>

<style scoped>
#title {
  position: absolute;
  left: 39px;
  top: 27px;
  width: 374px;
  height: 62px;
  opacity: 1;
  font-family: Source Han Sans;
  font-size: 35px;
  font-weight: bold;
  line-height: normal;
  letter-spacing: 0em;
  color: #0057C2;
}

.frame {
  position: absolute;
  margin-left: 10%;
  margin-top: 10%;
  width: 1100px;
  height: 550px;
  border-radius: 24px;
  opacity: 1;
  background: #FFFFFF;
  box-sizing: border-box;
  border: 6px solid #979797;
}

video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 24px;
}

#photo {
  position: absolute;
  left: 650px;
  top: 104px;
  width: 354px;
  height: 354px;
  opacity: 1;
  background: url(201.jpg);
}
#letter {
  position: absolute;
  left: 100px;
  top: 104px;
  width: 354px;
  height: 354px;
  opacity: 1;
  border-radius: 24px;

  font-family: Source Han Sans;
  font-size: 400px;
  font-weight: bold;
  line-height: 354px;
  letter-spacing: 0em;
  text-align: center;
  color: #0057C2;
}
h2{
  /* 0 marks in total */

  position: absolute;
  left: 842px;
  top: 919px;
  width: 237px;
  height: 45px;
  opacity: 1;
    
  font-size: 32px;
  font-weight: normal;
  line-height: normal;
  letter-spacing: 0em;
    
  font-feature-settings: "kern" on;
  color: #008407;
	
}

</style>
