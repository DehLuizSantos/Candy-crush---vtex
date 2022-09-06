import styled from 'styled-components';

export const GameBoardWrapper = styled.div`
  height: 320px;
  margin: auto;
  position: relative;
  table-layout: fixed;
  width: 320px;
  z-index: 1;
  margin-top: 10px;
`;

export const Cover = styled.div`
  z-index: 2;
  position: absolute;
  top: -500px;
  left: calc(50% - 160px);
  background-color: white;
  width: 320px;
  height: 500px;
`;

export const Canvas = styled.canvas`
  z-index: 10;
  position: absolute;
  top: 10px;
  left: calc(50% - 160px);
  opacity: 0.7;
`;

export const Buttons = styled.div`
  display: flex;
  justify-content: center;
  margin: 15px 0;
`;
