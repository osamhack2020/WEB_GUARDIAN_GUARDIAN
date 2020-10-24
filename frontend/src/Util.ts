import { BACKEND_URL } from "./Constant";
import axios from "axios";
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

export async function GetPostData(date: string, backurl: string) {
  return await axios.post(`${BACKEND_URL}/${backurl}`, { date })
}