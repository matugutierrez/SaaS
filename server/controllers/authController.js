const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Organization = require('../models/Organization');
const { JWT_SECRET } = require('../config/env');

function generateToken(user) {
  return jwt.sign({ userId: user._id, orgId: user.organization._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    let organization;
    let role = 'member';

    if (inviteCode) {
      organization = await Organization.findOne({ inviteCode });
      if (!organization) {
        return res.status(400).json({ error: 'Invalid invite code' });
      }
    } else {
      const existingOrg = await Organization.findOne({ slug: email.split('@')[0] });
      if (existingOrg) {
        return res.status(400).json({ error: 'Organization slug already exists' });
      }
      organization = await Organization.create({
        name: `${name}'s Organization`,
        slug: email.split('@')[0] + '-' + Date.now().toString(36),
        inviteCode: uuidv4().slice(0, 8).toUpperCase(),
      });
      role = 'owner';
    }

    const existingUser = await User.findOne({ email, organization: organization._id });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists in this organization' });
    }

    const user = await User.create({ name, email, password, organization: organization._id, role });
    const populated = await User.findById(user._id).populate('organization');
    const token = generateToken(populated);

    res.status(201).json({ token, user: populated });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).populate('organization');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
