import PNGRedCandy from 'assets/red-candy.png';
import PNGYellowCandy from 'assets/yellow-candy.png';
import PNGGreenCandy from 'assets/green-candy.png';
import PNGOrangeCandy from 'assets/orange-candy.png';
import PNGBlueCandy from 'assets/blue-candy.png';
import PNGPurpleCandy from 'assets/purple-candy.png';

export const getImageByColorName = (label: string) => {
  return {
    red: PNGRedCandy,
    yellow: PNGYellowCandy,
    green: PNGGreenCandy,
    orange: PNGOrangeCandy,
    blue: PNGBlueCandy,
    purple: PNGPurpleCandy,
  }[label];
};
