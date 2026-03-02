import { useModel } from '@umijs/max';
import type { FC } from 'react';

const BaseLayouts: FC = (props) => {
  const { initialState } = useModel('@@initialState');
  return <div>11</div>;
};

export default BaseLayouts;
