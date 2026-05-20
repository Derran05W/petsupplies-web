import {
  Heart,
  Shield,
  Stethoscope,
  Truck,
  Undo2,
  type LucideIcon,
} from 'lucide-react';

const BRAND_VALUE_ICONS: Record<string, LucideIcon> = {
  truck: Truck,
  stethoscope: Stethoscope,
  undo: Undo2,
  returns: Undo2,
  heart: Heart,
  shield: Shield,
};

export function brandValueIcon(icon?: string): LucideIcon {
  if (!icon) return Truck;
  return BRAND_VALUE_ICONS[icon.toLowerCase()] ?? Truck;
}

export const BRAND_VALUE_ICON_OPTIONS = [
  { value: 'truck', label: 'Truck (shipping)' },
  { value: 'stethoscope', label: 'Stethoscope (vet)' },
  { value: 'undo', label: 'Returns' },
  { value: 'heart', label: 'Heart' },
  { value: 'shield', label: 'Shield' },
] as const;
