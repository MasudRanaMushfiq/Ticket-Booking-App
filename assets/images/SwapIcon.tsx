// components/SwapIcon.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function SwapIcon({ size = 32, color = '#DA924E' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 15" fill="none">
      <Path
        d="M16 0L12 4H15V11C15 12.1 14.1 13 13 13C11.9 13 11 12.1 11 11V4C11 1.79 9.21 0 7 0C4.79 0 3 1.79 3 4V11H0L4 15L8 11H5V4C5 2.9 5.9 2 7 2C8.1 2 9 2.9 9 4V11C9 13.21 10.79 15 13 15C15.21 15 17 13.21 17 11V4H20L16 0Z"
        fill={color}
      />
    </Svg>
  );
}
