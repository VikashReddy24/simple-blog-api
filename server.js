const express = require('express');
const app = express();
const PORT = 3000;

/* =======================
   Middleware
======================= */
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

/* =======================
   In-memory Database
======================= */
let users = [];
let posts = [];
let comments = [];

let userId = 1;
let postId = 1;
let commentId = 1;

/* =======================
   Health Check
======================= */
app.get('/', (req, res) => {
    res.json({ message: 'Simple Blog API running' });
});

/* =======================
   Auth / Users
======================= */
app.post('/auth/register', (req, res) => {
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).json({ error: 'username and email required' });
    }

    const user = { id: userId++, username, email };
    users.push(user);

    res.status(201).json(user);
});

app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === Number(req.params.id));
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

/* =======================
   Posts
======================= */
app.post('/posts', (req, res) => {
    const { title, content, userId } = req.body;

    if (!title || !content || !userId) {
        return res.status(400).json({ error: 'title, content, userId required' });
    }

    const post = { id: postId++, title, content, userId };
    posts.push(post);

    res.status(201).json(post);
});

app.get('/posts', (req, res) => {
    res.json(posts);
});

app.get('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === Number(req.params.id));
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
});

app.put('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id === Number(req.params.id));
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    const { title, content } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;

    res.json(post);
});

app.delete('/posts/:id', (req, res) => {
    const index = posts.findIndex(p => p.id === Number(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Post not found' });
    }

    posts.splice(index, 1);
    res.json({ message: 'Post deleted' });
});

/* =======================
   Comments
======================= */
app.post('/posts/:id/comments', (req, res) => {
    const { content, userId } = req.body;

    if (!content || !userId) {
        return res.status(400).json({ error: 'content and userId required' });
    }

    const post = posts.find(p => p.id === Number(req.params.id));
    if (!post) {
        return res.status(404).json({ error: 'Post not found' });
    }

    const comment = {
        id: commentId++,
        content,
        postId: post.id,
        userId
    };

    comments.push(comment);
    res.status(201).json(comment);
});

app.get('/posts/:id/comments', (req, res) => {
    const postComments = comments.filter(
        c => c.postId === Number(req.params.id)
    );
    res.json(postComments);
});

/* =======================
   404 Handler (LAST)
======================= */
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});

/* =======================
   Start Server
======================= */
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
