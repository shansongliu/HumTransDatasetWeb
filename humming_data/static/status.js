// Set up basic variables
let musicFolders = [];
let musicFolderCount = 0;
let musicCount = 0;
let totalCountElement = document.getElementById('music-total-count');

getMusicCount();

// Get the recorded music count from the static/collected_data/username folder of the server
function getMusicCount() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/get-recorded-music-count', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            musicCount = xhr.responseText;
            getMusicFolders();
        } else {
            console.log('Failed to calculate recorded music count');
        }
    };
    xhr.send();
}

function getMusicFolders() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/get-music-folders/' + username, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            musicFolders = JSON.parse(xhr.responseText);
            musicFolderCount = musicFolders.length;
            totalCountElement.innerHTML = 'Totally there are ' + '<span style="color: blue; font-weight: bold; font-size: 26px;">' + musicFolderCount.toString() + '</span>' + ' folders and ' + '<span style="color: blue; font-weight: bold; font-size: 26px;">' + musicCount + '</span>' + ' audio files in your account, refresh this page to get the newest file status. You can check your recorded music files as below. Numbers are the folder names.';
            updateMusicFolders();
        } else {
            console.log('Failed to get music folders');
        }
    };
    xhr.send();
}

function updateMusicFolders() {
    let musicFoldersElement = document.getElementById('music-folders');
    musicFoldersElement.innerHTML = '';
    for (let i = 0; i < musicFolders.length; i++) {
        let folderName = musicFolders[i];
        let folderUrl = '/display-music/' + folderName;
        let folderLink = document.createElement('a');
        folderLink.href = folderUrl;
        folderLink.innerHTML = folderName;
        let folderItem = document.createElement('li');
        folderItem.appendChild(folderLink);
        musicFoldersElement.appendChild(folderItem);
    }
}