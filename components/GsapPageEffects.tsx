'use client';

import { GsapPage, useGsapAnimations } from '../hooks/useGsapAnimations';

type GsapPageEffectsProps = {
  page: GsapPage;
};

export default function GsapPageEffects({ page }: GsapPageEffectsProps) {
  useGsapAnimations(page);
  return null;
}
