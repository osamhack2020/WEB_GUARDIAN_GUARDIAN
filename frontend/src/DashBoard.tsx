import React, { useState, useEffect, useCallback } from "react";
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
import { DatePicker } from "antd";
import {GetPostData} from "./Util";
import { IMongoChart } from "./Interface";
import VideoListViewer from "./VideoListViewer"
import moment from 'moment';


const defaultChartData = (): any =>
  [...Array(23).keys()].map((v) => {
    return {
      name: `${v}시`,
      Motion: 0,
      Person: 0,
      Car: 0,
    };
  });

function Chart() {
  const [date, SetDate] = useState<string>(moment().format("YYYYMMDD"));
  const [hour, SetHour] = useState<string>("1")
  const [Chart, SetData] = useState<any>(defaultChartData());
  const [show, SetShow] = useState<boolean>(false);
  const SetChart = useCallback((chartData) => {
    SetData(chartData.map((v: IMongoChart, i: number) => {
      return {
        name: `${i}시`,
        Motion: v.motion,
        Person: v.person,
        Car: v.car,
      };
    }))
  }, [Chart]);

  useEffect(() => {
    GetPostData(date, "ChartData").then(res => {
      if (res.data === "fail") {
        SetData(defaultChartData())
      }
      else {
        SetChart(res.data)
      }
    });
    let chartTimer = setInterval(() => {
      GetPostData(date, "ChartData").then(res => {
        if (res.data === "fail") {
          SetData(defaultChartData())
        }
        else {
          SetChart(res.data)
        }
      });
    }, 60000)
    return () => {
      clearInterval(chartTimer)
    }
  }, [date]);

  return (
    <div style={{ width: "100%", height: "90vh" }}>
      <ResponsiveContainer>
        <LineChart
          data={Chart}
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
            onClick={() => alert('')}
            type="monotone"
            dataKey="Motion"
            stroke="#82ca9d"
            activeDot={{ onClick: (e :any) => { SetHour(e.payload.name.slice(0,-1));SetShow(true) } }}
          />
          <Line type="monotone" dataKey="Person" stroke="#ec6d59" activeDot={{ onClick: (e :any) => { SetHour(e.payload.name.slice(0,-1));SetShow(true) } }} />
          <Line type="monotone" dataKey="Car" stroke="#FF8200" activeDot={{ onClick: (e :any) => { SetHour(e.payload.name.slice(0,-1));SetShow(true) } }} />
        </LineChart>
      </ResponsiveContainer>

      <DatePicker allowClear={false} defaultValue={moment()} onChange={(m: moment.Moment | null, dateString: string) => SetDate(dateString.replace(/-/g, ""))} />
      <VideoListViewer date={date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8) + "_" + hour} visible={show} onClose={() => SetShow(false)} />
    </div>
  );
}
export default function DashBoard() {
  return <Chart />;
}

