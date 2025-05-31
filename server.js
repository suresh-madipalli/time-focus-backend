const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/focusdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
  username: String,
  streak: Number,
  lastCheckIn: Date
});
const User = mongoose.model('User', userSchema);

const videoContent = {
  'Morning Rituals': ['Exercise Video 1', 'Exercise Video 2'],
  'Deep Work': ['Focused Work 1', 'Focused Work 2'],
  'Execution Mode': ['Execution Video 1', 'Execution Video 2'],
  'Wrap-Up': ['Wrap Up Video 1', 'Wrap Up Video 2'],
  'Learning Hour': ['Learning Video 1', 'Learning Video 2'],
  'Wind Down': ['Relaxation Video 1', 'Relaxation Video 2']
};

app.get('/videos/:slot', (req, res) => {
  const slot = req.params.slot;
  res.json(videoContent[slot] || []);
});

app.post('/streak', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  let user = await User.findOne({ username });
  const now = new Date();
  if (!user) {
    user = new User({ username, streak: 1, lastCheckIn: now });
  } else {
    const last = user.lastCheckIn;
    const diff = (now - last) / (1000 * 60 * 60 * 24);
    if (diff < 2) user.streak += 1;
    else user.streak = 1;
    user.lastCheckIn = now;
  }
  await user.save();
  res.json({ streak: user.streak });
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});