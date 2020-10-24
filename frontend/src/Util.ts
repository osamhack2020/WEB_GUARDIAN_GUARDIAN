import { BACKEND_URL } from "./Constant";
/*

> Camera URL
`http://${window.location.hostname}:8081/camera_1`
`http://${window.location.hostname}:8081/camera_2`
`http://${window.location.hostname}:8081/camera_3`
    ...

 */

export const CameraRTSPUrl = [...Array(6).keys()].map(
  (v) => `${BACKEND_URL}/camera_1`
);
