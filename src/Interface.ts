import {IMainState,ISettingState} from "./Reducer";
export interface ILogItem{
    src : string,
    content : string,
    time : string
}

export interface IClickPos{
    X : number,
    Y : number
  }

  
export interface ISelect
{
  mainReducer : IMainState;
  settingReducer : ISettingState;
}