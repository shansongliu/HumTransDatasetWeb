const soundClips = document.querySelector('.saved-sound-clips');
const currentURL = window.location.href
let parts = currentURL.split('/');
let folderName = parts[parts.length - 1];

getAudioFiles(folderName);

// // Display the audio files in the current folder
// displayAudioFiles(folderName, audioFileLinks);

function getAudioFiles(folderName) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/get-music/' + folderName, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            let audioFiles = JSON.parse(xhr.responseText);
            displayAudioFiles(folderName, audioFiles);
        } else {
            console.log('Failed to get audio files');
        }
    };
    xhr.send();
}

function displayAudioFiles(folderName, audioFiles) {
    const folderDisplay = document.createElement('p');
    folderDisplay.textContent = folderName;
    folderDisplay.style.textAlign = 'center';
    folderDisplay.style.fontSize = '24px';
    folderDisplay.style.fontWeight = 'bold';
    soundClips.appendChild(folderDisplay)

    for (let i = 0; i < audioFiles.length; i++) {
        const clipContainer = document.createElement('article');
        const clipLabel = document.createElement('p');
        const deleteButton = document.createElement('button');
        let audioFile = audioFiles[i];
        let audioElement = document.createElement('audio');

        clipContainer.classList.add('clip');
        audioElement.setAttribute('controls', '');
        audioElement.controls = true;
        audioElement.src = '/static/collected_data/' + username + '/' + folderName + '/' + audioFile;
        clipLabel.textContent = audioFile
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete';

        clipContainer.appendChild(audioElement);
        clipContainer.appendChild(clipLabel);
        clipContainer.appendChild(deleteButton);
        soundClips.appendChild(clipContainer);

        // deleteButton.addEventListener('click', function() {
        //     if (confirm('Are you sure you want to delete this audio file?')) {
        //         deleteAudioFile(folderName, audioFile);
        //     }
        // }
    }

    // Add event listener to delete button
    soundClips.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete')) {
            if (confirm('Are you sure you want to delete this audio file?')) {
                const clipContainer = event.target.closest('.clip');
                const clipLabel = clipContainer.querySelector('p');
                const audioFile = clipLabel.textContent;
                deleteAudioFile(folderName, audioFile);
            }
        }
    });
}

function deleteAudioFile(folderName, audioFile) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/delete-music/' + folderName + '/' + audioFile, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Audio file deleted successfully');
            // Check if the folder is empty
            checkFolderEmpty(folderName);
        } else {
            console.log('Failed to delete audio file');
        }
    };
    xhr.send();
}

function checkFolderEmpty(folderName) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/get-music/' + folderName, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            let audioFiles = JSON.parse(xhr.responseText);
            if (audioFiles.length === 0) {
                deleteFolder(folderName);
            } else {
                // Reload the page to update the audio file list
                location.reload();
            }
        } else {
            console.log('Failed to get audio files');
        }
    };
    xhr.send();
}

function deleteFolder(folderName) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/delete-folder/' + folderName, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Folder deleted successfully');

            // Check if the current page is the status page
            if (window.location.href.indexOf('status') !== -1) {
                window.location.href = '/status';
            } else {
                // Reload the page to update the audio file list
                location.reload();
            }
        } else {
            console.log('Failed to delete folder');
        }
    };
    xhr.send();
}