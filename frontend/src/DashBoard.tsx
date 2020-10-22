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

function Chart() {
  const [data, SetData] = useState<any>([
    {
      name: "00시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "01시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "02시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "03시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "04시",
      Motion: 10,
      Person: 5,
      Car: 5,
    },
    {
      name: "05시",
      Motion: 34,
      Person: 24,
      Car: 10,
    },
    {
      name: "06시",
      Motion: 23,
      Person: 11,
      Car: 12,
    },
    {
      name: "07시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "08시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "09시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "10시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "11시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "12시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "13시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "14시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "15시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "16시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "17시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "18시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "19시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "20시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "21시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "22시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
    {
      name: "23시",
      Motion: 0,
      Person: 0,
      Car: 0,
    },
  ]);

  useEffect(() => {}, []);
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
