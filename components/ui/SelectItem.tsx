'use client';

import React from 'react';
import { SelectItem as HeroSelectItem } from '@heroui/react';

// HeroUI's <Select> uses react-aria's collection builder, which calls a
// static `getCollectionNode` on each child's component type. The previous
// implementation here was a plain function-component wrapper, which did not
// expose that static — so any HeroUI <Select> using this adapter crashed
// at render with: "o.getCollectionNode is not a function".
//
// Fix: re-export the native HeroSelectItem so the static method is
// preserved, and re-type it to accept the legacy `value` prop that
// existing consumers still pass.
export interface SelectItemProps {
  key?: string;
  value?: string;
  textValue?: string;
  className?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  children?: React.ReactNode;
}

const SelectItem = HeroSelectItem as unknown as React.FC<SelectItemProps>;

export default SelectItem;
