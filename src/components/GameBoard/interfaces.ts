export interface ICandy {
  color?: string | null;
  id?: number;
  row: number | null;
  col: number | null;
  toString: () => void;
}

export interface IDragDropInfo {
  initTop: any;
  initYCoord: any;
  initLeft: any;
  initXCoord: any;
  candyImg: any;
  initCol: any;
  initRow: any;
}

export interface IDetails {
  candy: ICandy;
  toRow: number;
  toCol: number;
  fromRow: number | null;
  fromCol: number | null;
}

export type IDirections = 'up' | 'down' | 'left' | 'right';
