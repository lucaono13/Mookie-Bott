import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const HOF_FILE = path.join(DATA_DIR, 'hall-of-fame.json');

export interface HallOfFameEntry {
    entry_title: string;
    message_link: string;
    message_content: string;
    author: { id: string; username: string };
    requester: { id: string; username: string };
    description: string;
    date_posted: number;
    files: string[];
}

// One file for all guilds, keyed by guild id
type HallOfFameFile = { [guildId: string]: HallOfFameEntry[] };

export class HallOfFameService {
    public addEntry(guildId: string, entry: HallOfFameEntry): void {
        let entries = this.loadFile();
        if (!entries[guildId]) {
            entries[guildId] = [];
        }
        entries[guildId].push(entry);
        this.save(entries);
    }

    // Entries are only written (never read) at runtime and approvals are rare,
    // so read the file fresh on each insert instead of holding it in memory
    private loadFile(): HallOfFameFile {
        try {
            return JSON.parse(readFileSync(HOF_FILE, 'utf-8'));
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return {};
            }
            throw error;
        }
    }

    private save(entries: HallOfFameFile): void {
        mkdirSync(DATA_DIR, { recursive: true });
        let tmpFile = `${HOF_FILE}.tmp`;
        writeFileSync(tmpFile, JSON.stringify(entries, null, 2), 'utf-8');
        renameSync(tmpFile, HOF_FILE);
    }
}
