'use client';

import { createContext, useContext } from 'react';

export interface SettingsDrawerContextValue {
  openSettings: () => void;
}

export const SettingsDrawerContext =
  createContext<SettingsDrawerContextValue | null>(null);

export function useSettingsDrawerOptional(): SettingsDrawerContextValue | null {
  return useContext(SettingsDrawerContext);
}
