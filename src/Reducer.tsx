import { createStore, combineReducers } from "redux";
import { createActionCreators, createReducerFunction, ImmerReducer,composeReducers } from "immer-reducer";
import {CameraRTSPUrl} from "./Util";
import {IClickPos} from "./Interface";
export interface IMainState
{
    ViewURL : string[]
}

export interface ISettingState
{
    UseCamera : string[]
    ConvexHullPos : IClickPos[][]
}

// State Init
const MainState: (IMainState) = {
    ViewURL: CameraRTSPUrl
}
// immer-Reducer
class MainReducer extends ImmerReducer<IMainState>{
    addComponent() { // ${item} in ${target} , index is start point
            this.draftState.ViewURL.push("http://")
    }

    // removeArea(index : number) {
    //     let draft = this.draftState['Area'] as Array<JSX.Element | null>;
    //     draft.splice(index,1);
    // }

    // makeArea() {
    //     let draft = this.draftState['Area'] as Array<JSX.Element | null>;
    //     draft.push(null);
    // }

    // addTextArea(content : string)
    // {
    //     this.draftState['TextArea'] = content;
    // }
}

const SettingState: (ISettingState) = {
    UseCamera: [],
    ConvexHullPos: Array.from(Array(6), () => new Array())
}
class SettingReducer extends ImmerReducer<ISettingState>{
   SetConvexHullPos(cameraIdx : number, Pos : IClickPos[])
   {
       this.draftState.ConvexHullPos[cameraIdx] = Pos;
   }
}

// Export (Store) and (Function for Dispatch)
export const MainActions = createActionCreators(MainReducer);
export const SettinActions = createActionCreators(SettingReducer);

const mainReducer = createReducerFunction(MainReducer, MainState);
const settingReducer = createReducerFunction(SettingReducer, SettingState);
 const rootReducer = combineReducers({mainReducer,settingReducer});
export const store = createStore(rootReducer);