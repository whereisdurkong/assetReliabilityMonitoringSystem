var express = require('express');
var bcrypt = require('bcrypt');
const router = express.Router();
var Sequelize = require('sequelize');
const nodemailer = require("nodemailer");
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// ===== MULTER SETUP =====
const uploadDir = path.join(__dirname, '../profile');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'));
  }
});
// ========================

var knex = require("knex")({
  client: 'mssql',
  connection: {
    user: process.env.USER,
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    database: process.env.DATABASE,
    port: parseInt(process.env.APP_SERVER_PORT),
    options: {
      enableArithAbort: true,
    }
  },
});

var db = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
  host: process.env.SERVER,
  dialect: "mssql",
  port: parseInt(process.env.APP_SERVER_PORT),
});

const { DataTypes } = Sequelize;

const Users1 = db.define('users_master', {
  id_master: { type: DataTypes.INTEGER, primaryKey: true },
  user_name: { type: DataTypes.STRING },
  emp_position: { type: DataTypes.STRING },
  emp_firstname: { type: DataTypes.STRING },
  emp_lastname: { type: DataTypes.STRING },
  emp_email: { type: DataTypes.STRING },
  emp_role: { type: DataTypes.STRING },
  emp_department: { type: DataTypes.STRING },
  pass_word: { type: DataTypes.STRING },
  created_by: { type: DataTypes.STRING },
  created_at: { type: DataTypes.STRING },
  is_active: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING }
}, {
  freezeTableName: false,
  timestamps: false,
  createdAt: false,
  updatedAt: false,
  tableName: 'users_master'
});

router.get('/test', async function (req, res) {
  try {
    const test = await knex('users_master').select('*');
    res.json(test);
  } catch (err) {
    console.log('INTERNAL ERROR: ', err);
  }
});

router.get('/get-all-users', async (req, res, next) => {
  try {
    const getAllUsers = await knex('users_master').select('*');
    res.json(getAllUsers);
    console.log('@@@ TRIGGERED /get-all-users');
  } catch (err) {
    console.log('Unable to fetch all users');
  }
});

router.get('/login', async function (req, res, next) {
  try {
    console.log(`Login attempt for user: ${req.query.user_name}`);
    const user = await Users1.findAll({ where: { user_name: req.query.user_name } });

    if (!user || user.length === 0) {
      return res.status(404).json({ msg: 'User not found! Try again...' });
    }
    if (req.query.pass_word !== user[0].pass_word) {
      return res.status(401).json({ msg: 'Incorrect password. Try again...' });
    }

    await knex('users_master').where({ id_master: user[0].id_master }).update({ is_active: 1 });

    const result = {
      id_master: user[0].id_master,
      user_name: user[0].user_name,
      emp_position: user[0].emp_position,
      emp_email: user[0].emp_email,
      emp_firstname: user[0].emp_firstname,
      emp_lastname: user[0].emp_lastname,
      is_active: user[0].is_active,
      emp_role: user[0].emp_role,
      emp_department: user[0].emp_department,
      emp_tier: user[0].emp_tier,
    };

    console.log(`User ${user[0].emp_department} Logged In`);
    res.json(result);
  } catch (err) {
    console.log("Error logging in: ", err);
    return res.status(404).json({ msg: 'User not found! Try again...' });
  }
});

router.post('/register', async function (req, res, next) {
  const currentTimestamp = new Date();
  const { emp_firstname, emp_lastname, user_name, pass_word, emp_email, emp_role, emp_position, emp_department, current_user } = req.body;

  try {
    const [user] = await knex('users_master').insert({
      emp_firstname, emp_lastname, user_name, pass_word, emp_email,
      emp_role, emp_department, emp_position,
      created_by: current_user, created_at: currentTimestamp, is_active: 1
    }).returning('id_master');

    const user_id = user.user_id || user;

    await knex('users_logs').insert({
      user_id,
      changes_made: `${user_name} was added by ${current_user}`,
      created_at: currentTimestamp,
      created_by: current_user
    });

    console.log(`@@@ TRIGGERED /register — ${user_name} by ${current_user}`);
    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    return res.status(404).json({ msg: 'Unable to Register user! ' + user_name });
  }
});

router.post('/register-email', async function (req, res, next) {
  try {
    const { user_name, pass_word, emp_email, current_user } = req.body;
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      secure: false,
      auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false }
    });

    const username = user_name.charAt(0).toUpperCase() + user_name.slice(1).toLowerCase();
    const body = `This is to inform you that your account has been created.<br><br>Username: <b>${user_name}</b><br>Temporary Password: <b>${pass_word}</b><br><br>`;
    const mailOptions = {
      from: process.env.EMAIL,
      to: emp_email,
      subject: 'Account Created',
      html: `Hello <b>${username}</b>,<br><br>${body}Best regards,<br>System`
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${emp_email}`);
    res.status(200).json({ message: 'Email sent' });
  } catch (err) {
    console.log('INTERNAL ERROR: ', err);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

router.post('/update-user', async (req, res, next) => {
  const currentTimestamp = new Date();
  const { id_master, emp_firstname, emp_lastname, user_name, emp_email, emp_role, emp_position, updated_by, emp_department } = req.body;
  console.log('Received update-user request: ', req.body);

  console.log(`@@@ TRIGGERED /update-user — ID ${id_master} by ${updated_by}`);
  try {
    await knex('users_master').where({ id_master }).update({
      emp_firstname, emp_lastname, user_name, emp_email,
      emp_role, emp_position, updated_at: currentTimestamp, updated_by, emp_department
    });

    await knex('users_logs').insert({
      user_id: id_master,
      changes_made: `User details updated for ${user_name} by ${updated_by}`,
      created_at: currentTimestamp,
      created_by: updated_by
    });

    console.log(`User updated: ${user_name} ID ${id_master}`);
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.log("INTERNAL ERROR: ", err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { id_master, updated_by, user_name } = req.body;
    const currentTimestamp = new Date();

    await knex('users_master').where({ id_master }).update({
      pass_word: '123456', updated_by, updated_at: currentTimestamp
    });

    await knex('users_logs').insert({
      user_id: id_master,
      changes_made: `${updated_by} reset password of ${user_name} to default.`,
      created_at: currentTimestamp,
      created_by: updated_by
    });

    console.log('@@@ TRIGGERED /reset-password');
    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.log('ERROR RESETTING PASSWORD: ', err);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

router.post('/deactivate-user', async (req, res) => {
  try {
    const { id_master, user_name, updated_by } = req.body;
    const currentTimestamp = new Date();

    await knex('users_master').where({ id_master }).update({
      is_active: '0', updated_by, updated_at: currentTimestamp
    });

    await knex('users_logs').insert({
      user_id: id_master,
      changes_made: `${updated_by} deactivated account of ${user_name}.`,
      created_at: currentTimestamp,
      created_by: updated_by
    });

    console.log('@@@ TRIGGERED /deactivate-user');
    res.status(200).json({ message: "User deactivated successfully" });
  } catch (err) {
    console.log('ERROR DEACTIVATING USER: ', err);
    res.status(500).json({ message: "Failed to deactivate user" });
  }
});

router.get('/get-by-username', async (req, res, next) => {
  try {
    const getCreatedBy = await Users1.findAll({ where: { user_name: req.query.user_name } });
    res.json(getCreatedBy[0]);
    console.log('Triggered /get-by-username');
  } catch (err) {
    console.log('GET BY USERNAME ERROR: ', err);
  }
});

router.get('/get-by-id', async (req, res, next) => {
  try {
    const getCreatedBy = await Users1.findAll({ where: { id_master: req.query.id } });
    res.json(getCreatedBy[0]);
    console.log('Triggered /get-by-id');
  } catch (err) {
    console.log('GET BY ID ERROR: ', err);
  }
});

// ===== UPLOAD AVATAR =====
router.post('/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { id_master } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get current avatar path from DB
    const user = await knex('users_master').where({ id_master }).select('avatar').first();

    // Delete old file if it exists
    if (user?.avatar) {
      const oldFilePath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        console.log(`Deleted old avatar: ${oldFilePath}`);
      }
    }

    const filePath = `profile/${req.file.filename}`;

    await knex('users_master').where({ id_master }).update({ avatar: filePath });

    console.log(`@@@ TRIGGERED /upload-avatar — ID ${id_master}: ${filePath}`);
    res.status(200).json({ message: 'Avatar uploaded successfully', avatar: filePath });
  } catch (err) {
    // If DB/delete fails, also clean up the newly uploaded file to avoid orphans
    if (req.file) {
      const newFilePath = path.join(__dirname, '..', 'profile', req.file.filename);
      if (fs.existsSync(newFilePath)) fs.unlinkSync(newFilePath);
    }
    console.log('Error uploading avatar: ', err);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

module.exports = router;