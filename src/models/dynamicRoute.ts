import { useCallback, useState } from 'react';

export default function dynamicRoute() {
  const [dynamicRoute, setDynamicRoute] = useState([]);
  const [counter, setCounter] = useState(0);

  const increment = useCallback(() => setCounter((c) => c + 1), []);
  const decrement = useCallback(() => setCounter((c) => c - 1), []);

  return { counter, increment, decrement };
}
