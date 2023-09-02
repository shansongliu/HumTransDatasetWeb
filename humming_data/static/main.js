// // fork getUserMedia for multiple browser versions, for the future
// // when more browsers support MediaRecorder

// navigator.getUserMedia = (navigator.getUserMedia ||
//                           navigator.webkitGetUserMedia ||
//                           navigator.mozGetUserMedia ||
//                           navigator.msGetUserMedia);

// Set up basic variables for app
const record = document.querySelector('.record');
const stop = document.querySelector('.stop');
const soundClips = document.querySelector('.sound-clips');
const canvas = document.querySelector('.visualizer');
const mainSection = document.querySelector('.main-controls');

// Disable stop button while not recording
stop.disabled = true;

// Visualiser setup - create web audio api context and canvas
let audioCtx;
const canvasCtx = canvas.getContext("2d");

// Music player setup
let musicList = [];
let musicNamesJSON;
window.musicNamesJSON = {};
let musicSearchInput = document.getElementById('music-search-input');
let musicSearchForm = document.getElementById('music-search-form');
let musicSearchButton = document.getElementById('music-search-button');
let musicNameSelect = document.getElementById('music-name-select');
let musicSegmentSelect = document.getElementById('music-segment-select');
let audioPlayer = null;
let musicPlayer = document.getElementById('music-player');

// Load main.json to musicNamesJSON
fetch('/static/main.json')
    .then(response => response.json())
    .then(data => {musicNamesJSON = data}); 
// var xhrJSONFile = new XMLHttpRequest();
// xhrJSONFile.open('GET', '/get-json-file', true);
// xhrJSONFile.onload = function() {
//     if (xhrJSONFile.status === 200) {
//         var data = JSON.parse(xhr.responseText);
//         musicNamesJSON = data;
//     }
// };
// xhrJSONFile.send();

// Main block for doing the audio recording
if (navigator.mediaDevices.getUserMedia) {
// if (navigator.getUserMedia) {
    console.log('getUserMedia supported.');

    // Load music list of the drop-down menu
    loadMusicList();

    // Define constraints to capture audio
    const constraints = { audio: true, video: false };

    // Create an array to store the audio chunks
    let chunks = [];

     // Define a success callback function for getUserMedia
    let onSuccess = function(stream) {
        // // Create a MediaRecorder object and bind it to the stream
        // const mediaRecorder = new MediaRecorder(stream);

        // // Call the visualize function to display the audio visualization
        // visualize(stream);

        // // Bind the start method of the MediaRecorder object to the record button
        // record.onclick = function() {
        //     // Display a 3s countdown before recording starts.
        //     let progress = document.querySelector('.progress-display');
        //     progress.innerText = "3";
        //     document.querySelector('.info-display').innerText = "";

        //     setTimeout(function() {
        //         progress.innerText = "2";
        //         setTimeout(function() {
        //             progress.innerText = "1";
        //             setTimeout(function() {
        //                 progress.innerText = "0";
        //                 // Play the music to be recorded
        //                 playMusic(musicPlayer.src, 0.5);
        //                 mediaRecorder.start();

        //             }, 1000);
        //         }, 1000);
        //     }, 1000);

        //     console.log(mediaRecorder.state);
        //     console.log("recorder started");
        //     // Change the color of the record button to red to indicate recording is in progress
        //     record.style.background = "red";

        //     // Disable the record button and enable the stop button
        //     stop.disabled = false;
        //     record.disabled = true;
        // }

        //////////////// Add Beep Sound ////////////////
        // Create a MediaRecorder object and bind it to the stream
        const mediaRecorder = new MediaRecorder(stream);
        // Call the visualize function to display the audio visualization
        visualize(stream);
        // Define a beep object to act as a reminder sound before recording
        let beep = new Audio("/static/sound/beep.mp3");
        let intervalId;

        // Bind the start method of the MediaRecorder object to the record button
        record.onclick = function() {
            // Display a 3s countdown before recording starts.
            let progress = document.querySelector('.progress-display');
            progress.innerText = "3";
            document.querySelector('.info-display').innerText = "";

            beep.play();
            setTimeout(function() {
                progress.innerText = "2";
                beep.play();
                setTimeout(function() {
                    progress.innerText = "1";
                    beep.play();
                    setTimeout(function() {
                        progress.innerText = "0";
                        beep.pause();
                        beep.currentTime = 0;
                        // Play the music to be recorded
                        playMusic(musicPlayer.src, 0.5);
                        startRecording();
                    }, 1500);
                }, 1500);
            }, 1500);        
        }

        function startRecording() {
            console.log(mediaRecorder.state);
            console.log("recorder started");
            // Play the music to be recorded
            playMusic(musicPlayer.src, 0.5);
            mediaRecorder.start();

            // Change the color of the record button to red to indicate recording is in progress
            record.style.background = "red";
            stop.disabled = false;
            record.disabled = true;
        }
        //////////////// Add Beep Sound ////////////////

        // Bind the stop method of the MediaRecorder object to the stop button
        stop.onclick = function() {
            // Stop the music playing if the audio recording is stopped
            audioPlayer.pause();
            mediaRecorder.stop();
            console.log(mediaRecorder.state);
            console.log("recorder stopped");
            // Reset the color of the record button
            record.style.background = "";
            record.style.color = "";
            // mediaRecorder.requestData();

            // Disable the stop button and enable the record button
            stop.disabled = true;
            record.disabled = false;
        }

        // Define an onstop callback function for the MediaRecorder object
        mediaRecorder.onstop = function(e) {
            console.log("data available after MediaRecorder.stop() called.");

            // Prompt the user to enter a name for the audio clip
            const clipName = prompt('Enter a name for your sound clip?', 'My unnamed clip');

            // Create HTML elements to display the audio clip
            const clipContainer = document.createElement('article');
            const clipLabel = document.createElement('p');
            const audio = document.createElement('audio');
            const deleteButton = document.createElement('button');
            const submitButton = document.createElement('button');

            // Add CSS classes to the HTML elements
            clipContainer.classList.add('clip');
            audio.setAttribute('controls', '');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete';
            submitButton.textContent = 'Submit';
            submitButton.className = 'submit'

            // Set the audio clip label to the user-entered name or a default name
            if(clipName === null) {
                clipLabel.textContent = 'My unnamed clip';
            } else {
                clipLabel.textContent = clipName;
            }

            // Add the HTML elements to the page
            clipContainer.appendChild(audio);
            clipContainer.appendChild(clipLabel);
            clipContainer.appendChild(deleteButton);
            clipContainer.appendChild(submitButton);
            soundClips.appendChild(clipContainer);

            // Set the audio element's source to the Blob URL of the recorded audio
            audio.controls = true;
            // const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
            const blob = new Blob(chunks, { 'type' : 'audio/mpeg' });
            chunks = [];
            const audioURL = window.URL.createObjectURL(blob);
            audio.src = audioURL;
            console.log("recorder stopped");

            // Bind a click event listener to the delete button to remove the audio clip from the page
            deleteButton.onclick = function(e) {
                e.target.closest(".clip").remove();
            }

            // Bind a click event listener to the submit button to submit the recorded audio to local storage
            submitButton.onclick = function(e) {
                const formData = new FormData();
                formData.append("musicName", musicNameSelect.value);
                formData.append("clipName", clipLabel.textContent);
                formData.append("audioBlob", blob);

                const xhrSave = new XMLHttpRequest();
                xhrSave.open('POST', '/upload', true);
                xhrSave.onload = function() {
                    if (xhrSave.status === 200) {
                        console.log('Upload successful');
                        // document.querySelector('.info-display').innerText = clipLabel.textContent + '.ogg audio uploaded successfully!';
                        document.querySelector('.info-display').innerText = clipLabel.textContent + '.mp3 audio uploaded successfully!';
                    } else {
                        console.log('Upload failed');
                        // document.querySelector('.info-display').innerText = clipLabel.textContent + '.ogg audio uploaded failed!';
                        document.querySelector('.info-display').innerText = clipLabel.textContent + '.mp3 audio uploaded failed!';
                    }
                }
                xhrSave.send(formData);
            }

            // Bind a click event listener to the clip label to allow the user to rename the audio clip
            clipLabel.onclick = function() {
                const existingName = clipLabel.textContent;
                const newClipName = prompt('Enter a new name for your sound clip?');
                if(newClipName === null) {
                    clipLabel.textContent = existingName;
                } else {
                    clipLabel.textContent = newClipName;
                }
            }
        }

        // Define an ondataavailable callback function for the MediaRecorder object
        mediaRecorder.ondataavailable = function(e) {
            chunks.push(e.data);
        }
    }

    // Define an error callback function for getUserMedia
    let onError = function(err) {
        console.log('The following error occured: ' + err);
    }

    // Request permission to access the user's microphone and call the success or error callback
    navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    // navigator.getUserMedia(constraints).then(onSuccess, onError);

} else {
    console.log('getUserMedia not supported on your browser!');
}

function visualize(stream) {
    if(!audioCtx) {
        audioCtx = new AudioContext();
    }

    const source = audioCtx.createMediaStreamSource(stream);

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    source.connect(analyser);
    //analyser.connect(audioCtx.destination);

    draw()

    function draw() {
        const WIDTH = canvas.width
        const HEIGHT = canvas.height;

        requestAnimationFrame(draw);

        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

        canvasCtx.beginPath();

        let sliceWidth = WIDTH * 1.0 / bufferLength;
        let x = 0;

        for(let i = 0; i < bufferLength; i++) {

            let v = dataArray[i] / 128.0;
            let y = v * HEIGHT / 2;

            if(i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }
}

// Music play function
function playMusic(musicUrl, volume) {
    if (audioPlayer) {
        audioPlayer.pause();
    }
    audioPlayer = new Audio(musicUrl);
    audioPlayer.loop = false;
    audioPlayer.volume = volume;
    audioPlayer.play();
}

// Get the music list from the static/play_data folder of the server
function loadMusicList() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/music-list', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            musicList = JSON.parse(xhr.responseText);
            updateMusicList(musicList);
        } else {
            console.log('Failed to load music list');
        }
    };
    xhr.send();
}

// Iterate through all music files and group them by music name and segment
function updateMusicList(musicList) {
    let musicNames = [];
    let musicSegments = {};

    musicList.forEach(function(musicFileName) {
        let [musicName, musicSegment] = musicFileName.split('_');
        if (!musicNames.includes(musicName)) {
            musicNames.push(musicName);
            musicSegments[musicName] = [];
        }
        if (!musicSegments[musicName].includes(musicSegment)) {
            musicSegments[musicName].push(musicSegment);
        }
    });

    // Update music name and segment dropdown lists
    musicNameSelect.innerHTML = '';
    musicSegmentSelect.innerHTML = '';

    musicNames.forEach(function(musicName) {
        let option = document.createElement('option');
        option.value = musicName;
        option.text = musicName;
        musicNameSelect.add(option);
    });

    // Update segment dropdown list when a music name is selected
    musicNameSelect.onchange = function() {
        let musicName = this.value;
        let segments = musicSegments[musicName];
        updateMusicSegmentList(segments);
        let initialSegment = segments[0];
        loadMusicFile(musicName, initialSegment);
        loadMusicPDF(musicName, initialSegment);
    };

    // Update segment dropdown list for initial music name
    let initialMusicName = musicNames[0];
    let initialSegments = musicSegments[initialMusicName];
    updateMusicSegmentList(initialSegments);
    // Load initial music file
    let initialSegment = initialSegments[0];
    loadMusicFile(initialMusicName, initialSegment);
    loadMusicPDF(initialMusicName, initialSegment);
}

// Update segment dropdown list
function updateMusicSegmentList(segments) {
    musicSegmentSelect.innerHTML = '';

    segments.forEach(function(segment) {
        let option = document.createElement('option');
        option.value = segment;
        option.text = segment;
        musicSegmentSelect.add(option);
    });
}

// Update segment dropdown list when a segment name is selected
musicSegmentSelect.onchange = function() {
    let musicName = musicNameSelect.value;
    let musicSegment = this.value;
    loadMusicFile(musicName, musicSegment);
    loadMusicPDF(musicName, musicSegment);
}

// Load music file
function loadMusicFile(musicName, musicSegment) {
    // let musicFileName = musicName + '_' + musicSegment + '.ogg';
    let musicFileName = musicName + '_' + musicSegment + '.mp3';
    let musicPlayer = document.getElementById('music-player');
    musicPlayer.src = '/static/play_data/' + musicFileName;

    let musicNameElement = document.getElementById('music-name');;
    if (musicNamesJSON[musicName]) {
        musicNameElement.innerHTML = musicNamesJSON[musicName].name;
    } else {
        musicNameElement.innerHTML = '';
    }
}

// Load music pdf
function loadMusicPDF(musicName, musicSegment) {
    let musicPDFFileSrc = '/static/play_pdf/' + musicName + '_' + musicSegment + '.pdf';
    loadPDF(musicPDFFileSrc);
}

function loadPDF(url) {
    pdfjsLib.getDocument(url).promise.then(function(pdf) {
        pdf.getPage(1).then(function(page) {
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');

            // Set canvas size
            var viewport = page.getViewport({scale: 1});
            canvas.width = viewport.width;
            canvas.height = viewport.height * (2 / 5);

            // Render PDF page
            page.render({canvasContext: context, viewport: viewport}).promise.then(function() {
                var container = document.getElementById('pdf-container');
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                container.appendChild(canvas);

                var prevButton = document.createElement('button');
                prevButton.innerText = 'prev';
                prevButton.addEventListener('click', function() {
                    showPage(pageNumber - 1);
                });
                container.appendChild(prevButton);

                var nextButton = document.createElement('button');
                nextButton.innerText = 'next';
                nextButton.addEventListener('click', function() {
                    showPage(pageNumber + 1);
                });
                container.appendChild(nextButton);

                // Add zoom in/out control
                var zoomInButton = document.createElement('button');
                zoomInButton.innerText = 'zoom in';
                zoomInButton.addEventListener('click', function() {
                    zoom(scale + 0.1);
                });
                container.appendChild(zoomInButton);

                var zoomOutButton = document.createElement('button');
                zoomOutButton.innerText = 'zoom out';
                zoomOutButton.addEventListener('click', function() {
                    zoom(scale - 0.1);
                });
                container.appendChild(zoomOutButton);

                var pageNumber = 1;
                var scale = 1;

                // Show page number
                function showPage(pageNumber) {
                    if (pageNumber < 1 || pageNumber > pdf.numPages) {
                        return;
                    }
                    container.removeChild(canvas);
                    pdf.getPage(pageNumber).then(function(page) {
                        viewport = page.getViewport({scale: scale});
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        page.render({canvasContext: context, viewport: viewport}).promise.then(function() {
                            container.appendChild(canvas);
                        });
                    });
                }

                // Zoom in/out
                function zoom(newScale) {
                    if (newScale < 0.1 || newScale > 10) {
                        return;
                    }
                    scale = newScale;
                    showPage(pageNumber);
                }
            });
        });
    });
}

// Provide a search function to facilitate finding music
function searchAndUpdateSegments(keyword) {
    let filteredMusicList = musicList.filter(function(musicFileName) {
        let musicName = musicFileName.split('_')[0];
        return musicName.includes(keyword);
    });

    if (filteredMusicList.length > 0) {
        let matchedMusicName = filteredMusicList[0].split('_')[0];
        musicNameSelect.value = matchedMusicName;

        let filteredSegments = filteredMusicList.filter(function(musicFileName) {
            let [filteredMusicName] = musicFileName.split('_');
            return filteredMusicName === matchedMusicName;
        }).map(function(musicFileName) {
            let [, musicSegment] = musicFileName.split('_');
            return musicSegment;
        });

        updateMusicSegmentList(filteredSegments);

        if (filteredSegments.length > 0) {
            musicSegmentSelect.value = filteredSegments[0];
            loadMusicFile(matchedMusicName, filteredSegments[0]);
            loadMusicPDF(matchedMusicName, filteredSegments[0]);
        }
    } else {
        alert('No such music name!');
    }
}

musicSearchButton.onclick = function() {
    let keyword = musicSearchInput.value;
    searchAndUpdateSegments(keyword);
};

musicSearchForm.onsubmit = function(e) {
    e.preventDefault();
    let keyword = musicSearchInput.value;
    searchAndUpdateSegments(keyword);    
}

window.onresize = function() {
    canvas.width = mainSection.offsetWidth;
}

window.onresize();