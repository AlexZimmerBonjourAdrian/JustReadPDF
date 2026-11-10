import { DEFAULT_VIEW_STATE, type ViewState } from './view-state.types';
import { ViewStateRepository } from './view-state.repository';
import { LoggerService } from '@/business/services/LoggerService';

export const ViewStateService = {
  async load(): Promise<ViewState> {
    const raw = await ViewStateRepository.load();
    return this.migrate(raw);
  },
  migrate(raw: unknown): ViewState {
    const base = { ...DEFAULT_VIEW_STATE };
    if (!raw || typeof raw !== 'object') return base;
    const r = raw as Partial<ViewState>;
    return {
      ...base,
      ...r,
      schemaVersion: 1,
    };
  },
  async save(patch: Partial<ViewState>): Promise<void> {
    const current = await this.load();
    const next = { ...current, ...patch, schemaVersion: 1 as const };
    await ViewStateRepository.save(next);
    LoggerService.debug('ViewStateService', 'saved');
  },
  async flush(patch: Partial<ViewState>): Promise<void> {
    await this.save(patch);
  },
};
