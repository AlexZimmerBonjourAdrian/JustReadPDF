import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_VIEW_STATE, type ViewState } from './view-state.types';
import { ViewStateService } from './view-state.service';

export function useViewState() {
  const [state, setState] = useState<ViewState>(DEFAULT_VIEW_STATE);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    ViewStateService.load().then((s) => {
      if (mounted) setState(s);
    });
    return () => { mounted = false; };
  }, []);

  const update = useCallback((patch: Partial<ViewState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      ViewStateService.save(patch).catch(() => {});
    }, 400);
  }, []);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    await ViewStateService.save(state);
  }, [state]);

  return { state, update, flush };
}
