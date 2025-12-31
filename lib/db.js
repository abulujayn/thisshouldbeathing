import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'db.json');

const SEED_IDEAS = [
    {
        id: '1',
        title: 'Subscription Terminator',
        description: 'A browser extension that generates a virtual card for free trials and automatically cancels it before you get charged. No more accidental $99/year charges.',
        author: 'founder@subterm.io',
        votes: 42,
        timestamp: Date.now() - 10000000,
        comments: [
            { id: 'c1', text: 'I need this yesterday.', author: 'JohnDoe@example.com', timestamp: Date.now() - 5000000 },
            { id: 'c2', text: 'Privacy.com kind of does this but manual.', author: 'TechWiz@gmail.com', timestamp: Date.now() - 2000000 }
        ]
    },
    {
        id: '2',
        title: 'Spotify for Ambient Noise',
        description: 'A high-quality streaming service dedicated to ambient noise (rain, cafe, white noise) with spatial audio support and custom mixing.',
        author: 'audio_nerd@ambient.fm',
        votes: 28,
        timestamp: Date.now() - 80000000,
        comments: []
    },
    {
        id: '3',
        title: 'Recipe Filter for "Life Story"',
        description: 'An AI browser extension that detects recipe blogs and immediately extracts just the ingredients and instructions, hiding the 5-page story about the author\'s grandmother.',
        author: 'hungry_coder@kitchen.io',
        votes: 156,
        timestamp: Date.now() - 500000,
        comments: [
            { id: 'c3', text: 'Shut up and take my money!', author: 'ChefBoy@gmail.com', timestamp: Date.now() - 100000 }
        ]
    }
];

export function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        return { ideas: SEED_IDEAS };
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
}

export function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}
