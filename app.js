const cameraView = document.querySelector("#camera--view"),
    cameraOutput = document.querySelector("#camera--output"),
    cameraSensor = document.querySelector("#camera--sensor"),
    cameraTrigger = document.querySelector("#camera--trigger")
const devices = navigator.mediaDevices.enumerateDevices();
let frontDeviceId;
let backDeviceId;

if (devices.length > 0) {
    /* defaults so all this will work on a desktop */
    frontDeviceId = devices[0].deviceId;
    backDeviceId = devices[0].deviceId;
}
/* look for front and back devices */
let forEach = devices.forEach (device => {
    if( device.kind === 'videoinput' ) {
        if( device.label && device.label.length > 0 ) {
            if( device.label.toLowerCase().indexOf( 'back' ) >= 0 )
                backDeviceId = device.deviceId
            else if( device.label.toLowerCase().indexOf( 'front' ) >= 0 )
                frontDeviceId = device.deviceId
        }
    }
});
/* close the temp stream */
const tracks = tempStream.getTracks()
if( tracks )
    for( let t = 0; t < tracks.length; t++ ) tracks[t].stop()
/* open the device you want */
const constraints = {
    video: true,
    deviceId: {exact: backDeviceId }
}
function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            track = stream.getTracks()[0];
            cameraView.srcObject = stream;
        })
        .catch(function (error) {
            console.error('Oops. Something is broken.', error);
        });
}

cameraTrigger.onclick = function () {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
    cameraOutput.src = cameraSensor.toDataURL("image/webp");
    cameraOutput.classList.add("taken");
};
window.addEventListener("load", cameraStart, false);