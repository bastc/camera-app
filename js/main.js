/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

'use strict';
window.onload = function() {
    const videoElement = document.querySelector('video'),
        canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');
    const videoSelect = document.querySelector('select#videoSource');
    const selectors = [videoSelect];
    var width = 800;
    var height = 0;

    function gotDevices(deviceInfos) {
        // Handles being called several times to update labels. Preserve values.
        const values = selectors.map(select => select.value);
        selectors.forEach(select => {
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }
        });
        const option = document.createElement('option');
        option.value = '';
        option.text = 'Selecteer een camera';
        videoSelect.append(option);
        for (let i = 0; i !== deviceInfos.length; ++i) {
            const deviceInfo = deviceInfos[i];
            // if (deviceInfo.label.indexOf('back') != -1) {
            const option = document.createElement('option');
            option.value = deviceInfo.deviceId;
            if (deviceInfo.kind === 'videoinput') {
                option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
                videoSelect.appendChild(option);
            } else {
                console.log('Some other kind of source/device: ', deviceInfo);
            }
            // }
        }
        selectors.forEach((select, selectorIndex) => {
            if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
                select.value = values[selectorIndex];
            }
        });
    }

    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

    function gotStream(stream) {
        window.stream = stream; // make stream available to console
        videoElement.srcObject = stream;
        height = videoElement.videoHeight / (videoElement.videoWidth / width);

        // Firefox currently has a bug where the height can't be read from
        // the video, so we will make assumptions if this happens.

        if (isNaN(height)) {
            height = width / (4 / 3);
        }

        // Refresh button list in case labels have become available
        return navigator.mediaDevices.enumerateDevices();
    }

    function handleError(error) {
        console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
    }

    function start() {
        if (window.stream) {
            window.stream.getTracks().forEach(track => {
                track.stop();
            });
        }
        const videoSource = videoSelect.value;
        const constraints = {
            video: {deviceId: videoSource ? {exact: videoSource} : undefined}
        };
        navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);

        startbutton.addEventListener('click', function (ev) {
            takepicture();
            ev.preventDefault();
        }, false);

        clearphoto();
    }

    function detect() {

        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {

            // Draw video overlay:
            canvas.width = ~~(100 * video.videoWidth / video.videoHeight);
            canvas.height = 100;
            context.drawImage(video, 0, 0, canvas.clientWidth, canvas.clientHeight);

            // Prepare the detector once the video dimensions are known:
            if (!detector) {
                var width = ~~(100 * video.videoWidth / video.videoHeight);
                var height = 100;
                var detector = new objectdetect.detector(width, height, 1.1, objectdetect.frontalface);
            }

            // Perform the actual detection:
            var coords = detector.detect(canvas);
            for (var i = 0; i < coords.length; ++i) {
                var coord = coords[i];

                // Rescale coordinates from detector to video coordinate space:
                coord[0] *= video.videoWidth / detector.canvas.width;
                coord[1] *= video.videoHeight / detector.canvas.height;
                coord[2] *= video.videoWidth / detector.canvas.width;
                coord[3] *= video.videoHeight / detector.canvas.height;

                // Draw coordinates on video overlay:
                context.beginPath();
                context.lineWidth = '2';
                context.fillStyle = 'rgba(0, 255, 255, 0.5)';
                context.fillRect(
                    coord[0] / video.videoWidth * canvas.clientWidth,
                    coord[1] / video.videoHeight * canvas.clientHeight,
                    coord[2] / video.videoWidth * canvas.clientWidth,
                    coord[3] / video.videoHeight * canvas.clientHeight);
                context.stroke();
            }
        }
    }

    function clearphoto() {
        var context = canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);

        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
    }

    function takepicture() {
        var context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            var data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
            if (window.stream) {
                window.stream.getTracks().forEach(track => {
                    track.stop();
                });
            }
        } else {
            clearphoto();
        }
    }

    videoSelect.onchange = start;
}
// start();