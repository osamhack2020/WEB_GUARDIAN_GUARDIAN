import React,{useEffect,useRef} from "react";

export default function Setting()
{
  const ref = useRef();
  // useEffect(()=>{
  //   let ctx : any = document.getElementById('canvas').getContext('2d');
  //   let img  :any = new Image();
  //     img.onload = function() {
  //       ctx.drawImage(img, 0, 0);
  //       ctx.beginPath();
  //       ctx.moveTo(30, 96);
  //       ctx.lineTo(70, 66);
  //       ctx.lineTo(103, 76);
  //       ctx.lineTo(170, 15);
  //       ctx.stroke();
  //     };
  //     img.src = "https://via.placeholder.com/480x270"
  // },[])
  return (
    <canvas
    id='canvas'
    style={{width:480,height:270,cursor:'pointer'}}
   
  />
  )
}