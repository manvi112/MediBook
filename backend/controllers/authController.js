import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/user.js';
import doctorProfileModel from '../models/doctorProfile.js';

const signupPatient = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    if (phone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create patient
    const patient = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: 'patient',
      phone,
    });

    req.session.userId = patient._id;
    req.session.role = patient.role;

    res.status(201).json({ success: true, message: 'Patient signed up successfully' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};



const signupDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, city } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!specialization || !city) {
      return res.status(400).json({ success: false, message: 'Specialization and city are required' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    if (phone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' });
    }

    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const doctor = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role: 'doctor',
      phone,
    });

    try {
      await doctorProfileModel.create({
        user: doctor._id,
        specialization,
        city,
        isApproved: false,
      });
    } catch (error) {
      await userModel.findByIdAndDelete(doctor._id);
      throw error;
    }

    req.session.userId = doctor._id;
    req.session.role = doctor.role;

    res.status(201).json({ success: true, message: 'Doctor signed up successfully' });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    req.session.userId = user._id;
    req.session.role = user.role;

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(200).json({ success: true, user: userWithoutPassword });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
};

const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { signupDoctor, signupPatient, login, logout, getMe }