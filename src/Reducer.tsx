import { createStore, combineReducers } from "redux";
import {
  createActionCreators,
  createReducerFunction,
  ImmerReducer,
  composeReducers,
} from "immer-reducer";
import { CameraRTSPUrl } from "./Util";
import { IClickPos, IDetectData } from "./Interface";
import { SwapLeftOutlined } from "@ant-design/icons";
export interface IMainState {
  ViewURL: string[];
  DetectLog: IDetectData[];
}

export interface ISettingState {
  UseCamera: string[];
  ConvexHullPos: IClickPos[][];
}

// State Init
const MainState: IMainState = {
  ViewURL: CameraRTSPUrl,
  DetectLog: [],
};

// immer-Reducer
class MainReducer extends ImmerReducer<IMainState> {
  addDetectLog(thumbnail: string, content: string, time: string) {
    this.draftState.DetectLog.push({
      thumbnail: `data:image/jpeg;base64,${thumbnail}`,
      content: content + " 식별",
      time: time,
    });
  }
  swap(a:string, b:string){
    
    var c = this.draftState.ViewURL[Number(a)];
    this.draftState.ViewURL[Number(a)] = this.draftState.ViewURL[Number(b)];
    this.draftState.ViewURL[Number(b)] = c;
  }
}

const SettingState: ISettingState = {
  UseCamera: [],
  ConvexHullPos: Array.from(Array(6), () => new Array()),
};
class SettingReducer extends ImmerReducer<ISettingState> {
  SetConvexHullPos(cameraIdx: number, Pos: IClickPos[]) {
    this.draftState.ConvexHullPos[cameraIdx] = Pos;
  }
}

// Export (Store) and (Function for Dispatch)
export const MainActions = createActionCreators(MainReducer);
export const SettinActions = createActionCreators(SettingReducer);

const mainReducer = createReducerFunction(MainReducer, MainState);
const settingReducer = createReducerFunction(SettingReducer, SettingState);
const rootReducer = combineReducers({ mainReducer, settingReducer });
export const store = createStore(rootReducer);
