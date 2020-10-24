import React, { useState, useCallback, useEffect } from "react";
import { Layout, Menu, Breadcrumb } from "antd";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { RuningFooter } from "./Setting";
import {
  DesktopOutlined,
  PieChartOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import "antd/dist/antd.css";
import io from "socket.io-client";
import Log from "./Log";
import "./index.css";
import { BACKEND_URL } from "./Constant";
import { useDispatch } from "react-redux";
import { MainActions } from "./Reducer";

const { Content, Footer, Sider } = Layout;
const socket = io(`${BACKEND_URL}/`, { transports: ["websocket"] });

function LogBar() {
  return (
    <Sider style={{ background: "white" }} width={300}>
      <Log />
    </Sider>
  );
}
function Logo() {
  return (
    <img
      style={{
        width: "64px",
        height: "64px",
        marginTop: "5px",
        marginBottom: "5px",
      }}
      src="/logo128.png"
    />
  );
}

function DetectCount(classes : string,_class : string)
{
  return classes.split(",").filter((v : string) => v === _class).length
}
export default function MainLayout({
  main,
  setting,
  dashboard,
}: {
  main: React.FunctionComponent;
  setting: React.FunctionComponent;
  dashboard: React.FunctionComponent;
}) {
  const [LeftBar, SetLeftBar] = useState<boolean>(false);
  const dispatch = useDispatch();
  const onLeftBar = (collapsed: boolean) => {
    SetLeftBar(collapsed);
  };
  const defaultSelecedKey = useCallback(() => {
    const pathname = window.location.pathname;
    if (pathname === "/") return "1";
    else if (pathname === "/setting") return "2";
    else if (pathname === "/dashboard") return "3";
    return "0";
  }, []);

  useEffect((): any => {
    socket.on("detect", function (res: string) {
      //  console.log(res)
      let DetectData = JSON.parse(res);
      let personCnt = DetectCount(DetectData.content,"person");
      let carCnt = DetectCount(DetectData.content,"car");
      let Content = ""
      if (personCnt !== 0)
        Content += `사람 ${personCnt}명 식별`; 
      if (carCnt !== 0)
        Content += `, 차 ${carCnt}대 식별`; 
      if (personCnt === 0 && carCnt === 0)
        Content = DetectData.content;
      dispatch(
        MainActions.addDetectLog(
          DetectData.thumbnail,
          Content,
          DetectData.time
        )
      );
    });
    return (): any => socket.off("frame"); // componentWillUnmount
  }, []);
  return (
    <Router>
      <Layout
        style={{ height: "100vh", overflowX: "hidden", overflowY: "hidden" }}
      >
        <Layout>
          <Sider
            width="180"
            collapsible
            collapsed={LeftBar}
            onCollapse={onLeftBar}
          >
            <Menu
              theme="dark"
              defaultSelectedKeys={[defaultSelecedKey()]}
              mode="inline"
              inlineIndent={LeftBar ? 10 : 50}
            >
              <Menu.Item
                key="logo"
                style={
                  LeftBar
                    ? {
                        paddingLeft: "10px",
                        height: "70px",
                        cursor: "default",
                        opacity: 1.0,
                      }
                    : { height: "70px", cursor: "default", opacity: 1.0 }
                }
                icon={<Logo />}
                disabled
              ></Menu.Item>
            </Menu>
            <Menu
              theme="dark"
              defaultSelectedKeys={[defaultSelecedKey()]}
              mode="inline"
            >
              <Menu.Item key="1" icon={<DesktopOutlined />}>
                CCTV 모니터링
                <Link to="/" />
              </Menu.Item>
              <Menu.Item key="2" icon={<SettingOutlined />}>
                설정
                <Link to="/setting" />
              </Menu.Item>
              <Menu.Item key="3" icon={<PieChartOutlined />}>
                통계
                <Link to="/dashboard" />
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout className="site-layout">
            <Content style={{ margin: "0 16px" }}>
              <div
                className="site-layout-background"
                style={{ padding: 24, minHeight: 360 }}
              >
                <Route exact path="/" component={main} />
                <Route path="/setting" component={setting} />
                <Route path="/dashboard" component={dashboard} />
              </div>
            </Content>
            <Route exact path="/setting" component={RuningFooter} />
          </Layout>
          <Route exact path="/" component={LogBar} />
        </Layout>
      </Layout>
    </Router>
  );
}
