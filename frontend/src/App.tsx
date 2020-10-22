import React, { useState } from "react";
import MainLayout from "./MainLayout";
import Main from "./Main";
import Setting from "./Setting";
import DashBoard from "./DashBoard";

function App() {
  return (
    <div className="App">
      <MainLayout main={Main} setting={Setting} dashboard={DashBoard} />
    </div>
  );
}

export default App;
