import { DEFAULT_BOARD_SIZE } from 'utils/constants';

export const isValidLocation = (row: number, col: number): boolean => {
  return (
    row >= 0 &&
    col >= 0 &&
    row <= DEFAULT_BOARD_SIZE &&
    col <= DEFAULT_BOARD_SIZE &&
    row == Math.round(row) &&
    col == Math.round(col)
  );
};
