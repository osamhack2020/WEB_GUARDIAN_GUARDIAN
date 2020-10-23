import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { BACKEND_URL } from "./Constant";

async function GetChartData() {
  let now = new Date();
  let year = now.getFullYear();
  let month = ('0' + `${now.getMonth() + 1}`).slice(-2);
  let day = ('0' + `${now.getDate()}`).slice(-2);
  let dateResult = `${year}${month}${day}`;
  console.log(dateResult)
  return await axios.post(`${BACKEND_URL}/ChartData`, { date: dateResult })
}

function Chart() {
  const [data, SetData] = useState<any>(
    [...Array(23).keys()].map((v) => {
      return {
        name: `${v}시`,
        Motion: 0,
        Person: 0,
        Car: 0,
      };
    })
  );

  useEffect(() => {
    GetChartData().then(res => SetData(res.data.map((v: any, i: any) => {
      return {
        name: `${i}시`,
        Motion: v.motion,
        Person: v.person,
        Car: v.car,
      };
    })));
  }, []);
  return (
    <div style={{ width: "100%", height: "90vh" }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis dy={100} />
          <Tooltip />
          <Legend chartHeight={3} />
          <Line
            type="monotone"
            dataKey="Motion"
            stroke="#82ca9d"
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" dataKey="Person" stroke="#ec6d59" />
          <Line type="monotone" dataKey="Car" stroke="#FF8200" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
export default function DashBoard() {
  return <Chart />;
}
