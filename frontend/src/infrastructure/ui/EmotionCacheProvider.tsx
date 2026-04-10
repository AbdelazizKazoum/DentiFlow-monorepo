'use client';

import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import stylisRTLPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

interface EmotionCacheProviderProps {
  children: React.ReactNode;
  locale: string;
}

// Client-side cache, shared for the whole session of the user in the browser.
const createEmotionCache = (locale: string) => {
  const isRtl = locale === 'ar';
  return createCache({
    key: isRtl ? 'mui-rtl' : 'mui-ltr',
    stylisPlugins: isRtl ? [prefixer, stylisRTLPlugin] : undefined,
  });
};

export default function EmotionCacheProvider({ children, locale }: EmotionCacheProviderProps) {
  // Use useMemo to ensure the cache is only created once per component mount
  const cache = React.useMemo(() => createEmotionCache(locale), [locale]);

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
