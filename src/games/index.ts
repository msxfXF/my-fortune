import { lazy, type LazyExoticComponent, type ComponentType } from 'react';

export const GAME_COMPONENTS: Record<string, LazyExoticComponent<ComponentType>> = {
  xiaoliuren: lazy(() => import('./XiaoLiuRen')),
  tarot: lazy(() => import('./Tarot')),
  guanyin: lazy(() => import('./Guanyin')),
  liuyao: lazy(() => import('./LiuYao')),
  bazi: lazy(() => import('./BaZi')),
  guandi: lazy(() => import('./Guandi')),
  meihua: lazy(() => import('./MeiHua')),
  shengxiao: lazy(() => import('./ShengXiao')),
  chenggu: lazy(() => import('./ChengGu')),
  numerology: lazy(() => import('./Numerology')),
  daily: lazy(() => import('./Daily')),
};
