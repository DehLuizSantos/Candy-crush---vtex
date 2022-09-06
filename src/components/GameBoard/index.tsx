import * as S from './styles';
import { useState, useEffect } from 'react';
import { ICandy, IDragDropInfo, IDetails, IDirections } from './interfaces';
import { getImageByColorName, isValidLocation } from 'helpers/index';
import { DEFAUL_SQUARE_DATA, DEFAULT_BOARD_SIZE, COLORS } from 'utils/constants';
import { Button } from 'components/Button';
import Candy from 'classes/candy';
import $ from 'jquery';

let candyCounter = 0;

const GameBoard = () => {
  const [square, setSquare] = useState<any>(DEFAUL_SQUARE_DATA);
  let dragDropInfo: IDragDropInfo | null = null;

  const getCandyAt = (row: number, col: number) => {
    if (isValidLocation(row, col)) {
      return square[row][col];
    }
  };

  const isEmptyLocation = (row: number, col: number): boolean => {
    if (getCandyAt(row, col)) {
      return false;
    }
    return true;
  };

  const moveTo = (candy: ICandy, toRow: number, toCol: number) => {
    if (isEmptyLocation(toRow, toCol)) {
      const details: IDetails = {
        candy: candy,
        toRow: toRow,
        toCol: toCol,
        fromRow: candy.row,
        fromCol: candy.col,
      };

      delete square[candy.row || 0][candy.col || 0];
      const squareCopy: any = [...square];

      squareCopy[toRow][toCol] = candy;

      setSquare(squareCopy);

      candy.row = toRow;
      candy.col = toCol;

      $(document).triggerHandler('move', details);
    }
  };

  const moveCandiesDown = () => {
    for (let col = 0; col < DEFAULT_BOARD_SIZE; col++) {
      // eslint-disable-next-line no-var
      var emptyRow = null;
      // eslint-disable-next-line no-var
      for (var emptyRow: any = DEFAULT_BOARD_SIZE - 1; emptyRow >= 0; emptyRow--) {
        if (getCandyAt(emptyRow, col) == null) {
          break;
        }
      }

      for (let row = emptyRow - 1; row >= 0; row--) {
        const candy = getCandyAt(row, col);
        if (candy != null) {
          moveTo(candy, emptyRow, col);
          emptyRow--;
        }
      }

      for (let spawnRow = -1; emptyRow >= 0; emptyRow--, spawnRow--) {
        addRandomCandy(emptyRow, col);
      }
    }
  };

  const onCrush = () => {
    setTimeout(function () {
      moveCandiesDown();
    }, 500);

    removeCrushes(getCandyCrushes());
  };

  const add = (candy: ICandy, row: number, col: number) => {
    if (isEmptyLocation(row, col)) {
      const candySize = 320 / DEFAULT_BOARD_SIZE;
      candy.row = row;
      candy.col = col;

      const copyTest: any = [...square];
      copyTest[row][col] = candy;
      setSquare(copyTest);

      const img = document.createElement('img');

      $('#gameboard').append(img);
      img.src = getImageByColorName(candy.color || '') || '';

      $(img).data('candy', candy);
      $(img).attr('id', 'candy-id-' + candy.id);

      $(img).attr('data-position', candy.col + '-' + candy.row);

      const top = candy.row * candySize;
      const left = candy.col * candySize;

      const startTop = 0 - (DEFAULT_BOARD_SIZE - top / candySize) * candySize;

      $(img).css({
        width: candySize,
        height: candySize,
        top: startTop,
        left: left,
        position: 'absolute',
        transition: 'opacity 0.4s ease-in-out',
        opacity: 1,
      });

      $(img).animate({ top: top }, function () {
        onCrush();
      });
    } else {
      console.log('add already found a candy at ' + row + ',' + col);
    }
  };

  const addRandomCandy = (row: number, col: number) => {
    const random_color = Math.floor(Math.random() * COLORS.length);
    const candy = new Candy(COLORS[random_color], candyCounter++);

    add(candy, row, col);
  };

  const populateBoard = (): void => {
    for (let col = 0; col < DEFAULT_BOARD_SIZE; col++) {
      for (let row = 0; row < DEFAULT_BOARD_SIZE; row++) {
        if (getCandyAt(row, col) == null) {
          addRandomCandy(row, col);
        }
      }
    }
  };

  const findColorStrips = (vertical: boolean, swap: ICandy[] | undefined) => {
    const getAt = (x: number, y: number) => {
      const result = vertical ? getCandyAt(y, x) : getCandyAt(x, y);
      if (swap) {
        const index = swap.indexOf(result || { row: 0, col: 0 });
        if (index >= 0) return swap[index ^ 1];
      }
      return result;
    };

    const result = [];
    for (let j = 0; j < DEFAULT_BOARD_SIZE; j++) {
      for (let h, k = 0; k < DEFAULT_BOARD_SIZE; k = h) {
        const firstCandy = getAt(j, k);
        h = k + 1;
        if (!firstCandy) continue;
        const candies = [firstCandy];
        for (; h < DEFAULT_BOARD_SIZE; h++) {
          const lastCandy = getAt(j, h);
          if (!lastCandy || lastCandy.color != firstCandy.color) break;
          candies.push(lastCandy);
        }

        if (candies.length >= 3) result.push(candies);
      }
    }
    return result;
  };

  const getCandyCrushes = (swap?: ICandy[] | undefined) => {
    const unioned: any = {};
    const sizes: any = {};
    let row, col;

    const find = (key: number): number => {
      let parent = unioned[key];
      if (parent == null) return key;
      parent = find(parent);
      unioned[key] = parent;
      return parent;
    };

    const size = (found: number) => {
      return sizes[found] || 1;
    };

    const union = (key1: number, key2: number) => {
      const p1 = find(key1);
      const p2 = find(key2);

      if (p1 == p2) return p1;
      unioned[p2] = p1;
      sizes[p1] = size(p1) + size(p2);
      delete sizes[p2];
    };

    const vert = findColorStrips(true, swap);
    const horiz = findColorStrips(false, swap);
    const sets = vert.concat(horiz);

    for (let j = 0; j < sets.length; j++) {
      const set: any = sets[j];
      for (let k = 1; k < set.length; k++) {
        union(set[0].id, set[k].id);
      }
    }

    const results: any = {};
    for (row = 0; row < DEFAULT_BOARD_SIZE; row++) {
      for (col = 0; col < DEFAULT_BOARD_SIZE; col++) {
        const candy = getCandyAt(row, col);
        if (candy) {
          const p = find(candy.id || 0);
          if (size(p) >= 3) {
            if (!(p in results)) results[p] = [];
            results[p].push(candy);
          }
        }
      }
    }

    const list = [];
    for (const key in results) {
      list.push(results[key]);
    }
    return list;
  };

  const remove = (candy: ICandy) => {
    delete square[candy.row || 0][candy.col || 0];
    const copy = [...square];
    copy[candy.row || 0][candy.col || 0] = null;
    candy.row = candy.col = null;

    setSquare(copy);

    const img = document.getElementById('candy-id-' + candy.id)!;
    img.style.opacity = '0';

    const timer = setTimeout(() => {
      img?.parentNode?.removeChild(img);
    }, 400);

    clearTimeout(timer);
  };

  const removeAt = (row: number, col: number) => {
    if (isEmptyLocation(row, col)) {
      console.log('removeAt found no candy at ' + row + ',' + col);
    } else {
      if (square[row][col] === null) return;
      remove(square[row][col]);
    }
  };

  const clear = () => {
    for (const r in square) {
      for (const c in square[r]) {
        if (square[r][c]) {
          removeAt(parseInt(r), parseInt(c));
        }
      }
    }
  };

  const removeCrushes = (setOfSetsOfCrushes: any) => {
    for (let j = 0; j < setOfSetsOfCrushes.length; j++) {
      const set = setOfSetsOfCrushes[j];
      for (let k = 0; k < set.length; k++) {
        remove(set[k]);
      }
    }
  };

  const prepareNewGame = () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      populateBoard();
      const crushable: any = getCandyCrushes();
      if (crushable.length == 0) break;
      removeCrushes(crushable);
    }
  };

  const ClearCanvas = () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    ctx?.clearRect(0, 0, 320, 320);
  };

  const getCandyInDirection = (fromCandy: ICandy, direction: IDirections) => {
    const row = fromCandy?.row || 0;
    const col = fromCandy?.col || 0;

    switch (direction) {
      case 'up': {
        return getCandyAt(row - 1, col);
      }
      case 'down': {
        return getCandyAt(row + 1, col);
      }
      case 'left': {
        return getCandyAt(row, col - 1);
      }
      case 'right': {
        return getCandyAt(row, col + 1);
      }
    }
  };

  const getCandiesToCrushGivenMove = (fromCandy: ICandy, direction: IDirections) => {
    const toCandy: any = getCandyInDirection(fromCandy, direction);
    if (!toCandy || toCandy.color === fromCandy.color) {
      return [];
    }

    const swap = [fromCandy, toCandy];
    const crushable: any = getCandyCrushes(swap);
    const connected = crushable.filter((set: ICandy[]) => {
      for (let k = 0; k < swap.length; k++) {
        if (set.indexOf(swap[k]) >= 0) return true;
      }
      return false;
    });

    // eslint-disable-next-line prefer-spread
    return [].concat.apply([], connected);
  };

  const numberCandiesCrushedByMove = (fromCandy: ICandy, direction: IDirections) => {
    return getCandiesToCrushGivenMove(fromCandy, direction).length;
  };

  const isMoveTypeValid = (fromCandy: ICandy, direction: IDirections) => {
    return numberCandiesCrushedByMove(fromCandy, direction) > 0;
  };

  const flipCandies = (candy1: ICandy, candy2: ICandy) => {
    const details1 = {
      candy: candy1,
      toRow: candy2.row,
      toCol: candy2.col,
      fromRow: candy1.row,
      fromCol: candy1.col,
    };
    const details2 = {
      candy: candy2,
      toRow: candy1.row,
      toCol: candy1.col,
      fromRow: candy2.row,
      fromCol: candy2.col,
    };

    candy1.row = details1.toRow;
    candy1.col = details1.toCol;

    const copyTest = [...square];
    copyTest[details1.toRow || 0][details1.toCol || 0] = candy1;
    setSquare(copyTest);

    candy2.row = details2.toRow;
    candy2.col = details2.toCol;
    copyTest[details2.toRow || 0][details2.toCol || 0] = candy2;

    $(document).triggerHandler('move', details1);
    $(document).triggerHandler('move', details2);
  };

  const onNewGame = () => {
    clear();
    ClearCanvas();
    prepareNewGame();
  };

  useEffect(() => {
    prepareNewGame();

    $(document).on('mousedown touchstart', '#canvas', function (evt: any) {
      if ($('img').is(':animated') == false) {
        const candySize = 320 / DEFAULT_BOARD_SIZE;
        let xCoord, yCoord;

        if (evt.type == 'mousedown') {
          xCoord = evt.offsetX;
          yCoord = evt.offsetY;
        } else {
          xCoord =
            parseInt(evt.touches[0].clientX) -
            (parseInt(evt.target.offsetLeft) + parseInt(evt.target.offsetParent.offsetLeft));
          yCoord =
            parseInt(evt.touches[0].clientY) -
            (parseInt(evt.target.offsetTop) + parseInt(evt.target.offsetParent.offsetTop));
        }

        const col = Math.floor(xCoord / candySize);
        const row = Math.floor(yCoord / candySize);

        const img = document
          .querySelectorAll<HTMLElement>("[data-position='" + col + '-' + row + "']")
          .item(0);

        if (img !== null) {
          img.style.zIndex = '2';

          const top = parseInt(img.style.top);
          const left = parseInt(img.style.left);

          dragDropInfo = {
            candyImg: img,
            initCol: col,
            initRow: row,
            initTop: top,
            initLeft: left,
            initXCoord: xCoord,
            initYCoord: yCoord,
          };
        }
      }
    });

    $(document).on('mousemove touchmove', '#canvas', function (evt: any) {
      if (dragDropInfo != null && $('img').is(':animated') == false) {
        let xCoord, yCoord;

        if (evt.type == 'mousemove') {
          xCoord = evt.offsetX;
          yCoord = evt.offsetY;
        } else {
          xCoord =
            parseInt(evt.touches[0].clientX) -
            (parseInt(evt.target.offsetLeft) + parseInt(evt.target.offsetParent.offsetLeft));
          yCoord =
            parseInt(evt.touches[0].clientY) -
            (parseInt(evt.target.offsetTop) + parseInt(evt.target.offsetParent.offsetTop));
        }

        const top = dragDropInfo.initTop + yCoord - dragDropInfo.initYCoord;
        const left = dragDropInfo.initLeft + xCoord - dragDropInfo.initXCoord;
        dragDropInfo.candyImg.style.top = `${top}px`;
        dragDropInfo.candyImg.style.left = `${left}px`;
      }
    });

    $(document).on('mouseup touchend', function (evt: any) {
      if (dragDropInfo !== null) {
        ClearCanvas();

        const candySize = 320 / DEFAULT_BOARD_SIZE;
        let xCoord, yCoord;

        if (evt.type == 'mouseup') {
          xCoord = evt.offsetX;
          yCoord = evt.offsetY;
        } else {
          xCoord =
            parseInt(evt.changedTouches[0].clientX) -
            (parseInt(evt.target.offsetLeft) + parseInt(evt.target.offsetParent.offsetLeft));
          yCoord =
            parseInt(evt.changedTouches[0].clientY) -
            (parseInt(evt.target.offsetTop) + parseInt(evt.target.offsetParent.offsetTop));
        }

        const col = Math.floor(xCoord / candySize);
        const row = Math.floor(yCoord / candySize);

        const currentCandyId = parseInt(dragDropInfo.candyImg.id.replace(/\D/g, ''));
        const currentCandy = square
          .map((row: ICandy[]) => {
            return row.find((candy: ICandy | null) => {
              if (candy) {
                return candy.id === currentCandyId;
              }
            });
          })
          .filter((element: ICandy) => element !== undefined);

        const candy: ICandy = currentCandy[0];

        //up
        if (dragDropInfo.initCol == col && dragDropInfo.initRow - 1 == row) {
          if (isMoveTypeValid(candy, 'up')) {
            flipCandies(candy, getCandyInDirection(candy, 'up'));
          }
        }
        //down
        else if (dragDropInfo.initCol == col && dragDropInfo.initRow + 1 == row) {
          if (isMoveTypeValid(candy, 'down')) {
            flipCandies(candy, getCandyInDirection(candy, 'down'));
          }
        }
        //left
        else if (dragDropInfo.initCol - 1 == col && dragDropInfo.initRow == row) {
          if (isMoveTypeValid(candy, 'left')) {
            flipCandies(candy, getCandyInDirection(candy, 'left'));
          }
        }
        //right
        else if (dragDropInfo.initCol + 1 == col && dragDropInfo.initRow == row) {
          if (isMoveTypeValid(candy, 'right')) {
            flipCandies(candy, getCandyInDirection(candy, 'right'));
          }
        }

        dragDropInfo.candyImg.style.zIndex = '1';
        dragDropInfo.candyImg.style.top = `${dragDropInfo.initTop}px`;
        dragDropInfo.candyImg.style.left = `${dragDropInfo.initLeft}px`;

        dragDropInfo = null;
      }
    });

    $(document).on('move', function (e, info) {
      e.preventDefault();
      const img = document.getElementById('candy-id-' + info.candy.id)!;
      const candySize = 320 / DEFAULT_BOARD_SIZE;
      const top = info.toRow * candySize;
      const left = info.toCol * candySize;

      $(img).attr('data-position', info.toCol + '-' + info.toRow);
      $(img).animate({ top: top, left: left }, function () {
        onCrush();
      });
    });
  }, []);

  return (
    <>
      <S.Cover id='cover' />
      <S.GameBoardWrapper id='gameboard' />
      <S.Canvas id='canvas' width='320' height='320'>
        <p>Canvas not supported on your browser.</p>
      </S.Canvas>
      <Button onAction={() => onNewGame()}>NEW GAME</Button>
    </>
  );
};

export default GameBoard;
