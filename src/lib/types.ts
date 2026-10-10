import type { Entry } from './schema';
import type { RepoStats } from './stats';

export type EntryWithStats = Entry & { stats?: RepoStats };
