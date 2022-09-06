import * as S from './styles';
import { ButtonProps } from './interfaces';

export const Button = ({ children, onAction }: ButtonProps) => {
  return <S.ButtonWrapper onClick={onAction}>{children}</S.ButtonWrapper>;
};
