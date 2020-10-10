
/*

> Camera URL
`http://${window.location.hostname}:8081/camera_1`
`http://${window.location.hostname}:8081/camera_2`
`http://${window.location.hostname}:8081/camera_3`
    ...

 */

 
export const CameraRTSPUrl = ((url : string)  => [...Array(6).keys()].map(v => `http://${url}:8081/camera_${v + 1}`))('gron1gh2.southeastasia.cloudapp.azure.com');
