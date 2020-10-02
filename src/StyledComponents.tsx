import React from "react";
import styled from "styled-components"
import { Scrollbars } from "react-custom-scrollbars";

interface IScroll
{
    autoHide : Boolean
}

export const CustomScrollbar = styled(Scrollbars)<IScroll>`
    height: 100%;
`