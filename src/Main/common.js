import styled from 'styled-components';
import theme from 'style';

export const MainContainer = styled.div`
  width: 100%;
  height: calc(100% - ${theme.rem(36)});

  padding-top: ${theme.rem(36)};

  background-color: ${theme.color.white};

  font-family: 'proxima-nova', 'arial black', sans-serif;
  font-size: ${theme.rem(14)};
  font-weight: ${theme.weight.light};
`;

export const TextAreaContainer = styled.div`
  width: calc(100% - ${theme.rem(48 * 2)});
  height: calc(100% - ${theme.rem(48)});
  margin: 0 ${theme.rem(48)};

  padding: 3px;
  overflow: overlay;

  &::-webkit-scrollbar {
    width: 3px;
    height: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(242, 221, 134, 0.5);
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(242, 221, 134, 1);
  }
`;

export const Bar = styled.div`
  background-color: ${({ primary }) => (primary ? theme.color.primary : theme.color.white)};
  display: flex;
  flex-direction: ${({ orientation }) => (orientation === 'horizontal' ? 'row' : 'column')};
  height: ${theme.rem(26)};
`;
