import { useSearchParams as _useSearchParams } from 'react-router-dom';

/**
 * Returns ReadOnly search params
 */
export const useSearchParams = () => {
  const [searchParams] = _useSearchParams();

  return searchParams;
};
