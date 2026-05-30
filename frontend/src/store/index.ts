import {create} from 'zustand';
import {createAuthSlice} from './slices/authSlice';
import {createCanvasSlice} from './slices/canvasSlice';
import {createFlowSlice} from './slices/flowSlice';
import type {AppState} from '@/types';

/** Global Zustand store composed from auth, canvas, and flow slices. */
const useStore = create<AppState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createCanvasSlice(...a),
  ...createFlowSlice(...a),
}));

export default useStore;