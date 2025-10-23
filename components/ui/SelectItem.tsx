'use client';

import React from 'react';
import { SelectItem as HeroSelectItem } from '@heroui/react';

// This adapter component solves the TypeScript error with value prop
export interface SelectItemProps {
  key?: string;
  value: string;
  textValue: string;
  className?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  children?: React.ReactNode;
}

// Create a compatibility wrapper that handles the type issues
const SelectItem = (props: SelectItemProps) => {
  const { value, ...rest } = props;

  return <HeroSelectItem {...rest}>{props.children}</HeroSelectItem>;
};

export default SelectItem;
