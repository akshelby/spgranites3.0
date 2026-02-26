import { useEffect } from 'react';

const BASE_TITLE = 'SP Granites';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} - Premium Stone Works`;
    return () => {
      document.title = `${BASE_TITLE} - Premium Stone Works`;
    };
  }, [title]);
}
