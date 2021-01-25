const {Router} = require('express')
const bcrypt = require('bcryptjs')
const {check, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const router = Router()
const User = require('../models/User')
const config = require('config')

// /api/auth/register
router.post(
  '/register',
  [
    check('email', 'Email error').isEmail(),
    check('password', 'Length of password is less then 6 symbols')
      .isLength({ min: 6 })
  ],
  async(req, res) => {
    try {
      const errors = validationResult(req)

      // Check validation
      if (! errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Incorrect data with registration',
        })
      }

      const {email, password} = req.body

      const candidate = await User.findOne({ email: email })

      // If user already exist
      if (candidate) {
        return res.status(400).json({
          message: 'Such user already exist'
        })
      }
      // Encrypt the password
      const hashedPassword = await bcrypt.hash(password, 12)
      const user = new User({
        email,
        password: hashedPassword,
      })

      // Save the user
      await user.save()

      // Answer to frontend
      res.status(201).json({
        message: 'User is created'
      })
    } catch (err) {
      res.status(500).json({
        message: 'Error, try one more time'
      })
      console.error(err)
    }
})

// /api/auth/login
router.post(
  '/login',
  [
    check('email', 'Input correct email').normalizeEmail().isEmail(),
    check('password', 'Input the password').exists()
  ],
  async(req, res) => {
    try {
      const errors = validationResult(req)

      // Validation
      if (! errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Incorrect data with registration',
        })
      }

      const {email, password} = req.body

      const user = await User.findOne({ email })

      // If user not found
      if (! user) {
        return res.status(400).json({
          message: 'User is not found'
        })
      }

      const isMatch = await bcrypt.compare(password, user.password)

      // Incorrect password
      if (! isMatch ) {
        return res.status(400).json({
          message: 'Incorrect password'
        })
      }

      const token = jwt.sign(
        { userId: user.id },
        config.get('jwtSecret'),
        { expiresIn: '1h' }
      )


      // Answer to frontend
      res.json({
        token,
        userId: user.id,
      })
    } catch (err) {
      res.status(500).json({
        message: 'Error, try one more time'
      })
      console.error(err)
    }
})


module.exports = router