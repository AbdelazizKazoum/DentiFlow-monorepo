import { render } from '@testing-library/react';
import EmotionCacheProvider from '../EmotionCacheProvider';

describe('EmotionCacheProvider component', () => {
  it('renders children', () => {
    const { getByText } = render(
      <EmotionCacheProvider locale="en">
        <div>Child Content</div>
      </EmotionCacheProvider>
    );
    expect(getByText('Child Content')).toBeInTheDocument();
  });

  it('handles rtl locales', () => {
    const { getByText } = render(
      <EmotionCacheProvider locale="ar">
        <div>RTL Content</div>
      </EmotionCacheProvider>
    );
    expect(getByText('RTL Content')).toBeInTheDocument();
  });
});
