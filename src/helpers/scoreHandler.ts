import { ICandy } from 'components/GameBoard/interfaces';

let score = 0;

const onScoreUpdate = (info: any) => {
  const scoreLabel = document.getElementById('scoreLabel');

  if (!scoreLabel) return;

  scoreLabel.innerHTML = '';
  scoreLabel.innerHTML = info.score + ' points';

  if (info.candy != undefined) {
    scoreLabel.style.backgroundColor = info.candy.color;

    if (info.candy.color == 'yellow') {
      scoreLabel.style.color = 'gray';
    } else {
      scoreLabel.style.color = 'white';
    }
  } else {
    scoreLabel.style.backgroundColor = 'lightgrey';
    scoreLabel.style.color = 'black';
  }
};

const resetScore = () => {
  score = 0;
  onScoreUpdate({ score: 0 });
};

const incrementScore = (candy: ICandy, row: number, col: number) => {
  score += 1;
  onScoreUpdate({
    score,
    candy: candy,
    row: row,
    col: col,
  });
};

export { score, incrementScore, resetScore };
