import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Initial data if file doesn't exist
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

function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        return { ideas: SEED_IDEAS };
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Routes
app.get('/api/ideas', (req, res) => {
    const db = readDB();
    res.json(db.ideas);
});

app.post('/api/ideas', (req, res) => {
    const db = readDB();
    const newIdea = {
        ...req.body,
        id: Date.now().toString(),
        timestamp: Date.now(),
        votes: 1, // Self vote
        comments: []
    };
    db.ideas.push(newIdea);
    writeDB(db);
    res.status(201).json(newIdea);
});

app.post('/api/ideas/:id/vote', (req, res) => {
    const { id } = req.params;
    const { direction } = req.body; // 1 or -1
    const db = readDB();
    const idea = db.ideas.find(i => i.id === id);
    if (idea) {
        idea.votes = Math.max(0, idea.votes + direction);
        writeDB(db);
        res.json(idea);
    } else {
        res.status(404).json({ error: 'Idea not found' });
    }
});

app.post('/api/ideas/:id/comment', (req, res) => {
    const { id } = req.params;
    const { text, author } = req.body;
    const db = readDB();
    const idea = db.ideas.find(i => i.id === id);
    if (idea) {
        const newComment = {
            id: Date.now().toString(),
            text,
            author: author || 'Anonymous',
            timestamp: Date.now()
        };
        idea.comments.push(newComment);
        writeDB(db);
        res.json(newComment);
    } else {
        res.status(404).json({ error: 'Idea not found' });
    }
});

app.delete('/api/ideas/:id', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    db.ideas = db.ideas.filter(i => i.id !== id);
    writeDB(db);
    res.json({ success: true });
});

app.delete('/api/ideas/:ideaId/comments/:commentId', (req, res) => {
    const { ideaId, commentId } = req.params;
    const db = readDB();
    const idea = db.ideas.find(i => i.id === ideaId);
    if (idea) {
        idea.comments = idea.comments.filter(c => c.id !== commentId);
        writeDB(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Idea not found' });
    }
});

app.post('/api/ideas/:id/reset-votes', (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const idea = db.ideas.find(i => i.id === id);
    if (idea) {
        idea.votes = 0;
        writeDB(db);
        res.json(idea);
    } else {
        res.status(404).json({ error: 'Idea not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
