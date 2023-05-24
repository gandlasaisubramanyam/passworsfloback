const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const router = express.Router()

const Users = require('../Models/user.model')

//signup
router.post('/signup', async (req, res) => {
  try {
    const payload = req.body
    payload.hashedPassword = await bcrypt.hash(payload.password, 10)
    delete payload.password
    let user = new Users(payload) //creating mongoose object
    await user.save((err, data) => {
      if (err) {
        return res.status(400).send({
          message: ' User Already Exist .'
        })
      }
      return res.status(201).send({
        message: 'User has been registered successfully.',
        user: data
      })
    })
  } catch (err) {
    console.log('Error: ', err)
    return res.status(500).send({
      message: 'Internal Server Error'
    })
  }
})

// signin
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body

    const existingUser = await Users.findOne({ email: email })
    console.log('Existing User: ', existingUser)
    if (existingUser) {
      const isValidUser = await bcrypt.compare(
        password,
        existingUser.hashedPassword
      ) //true or false
      console.log('IsValid:', isValidUser)
      if (isValidUser) {
        const token = jwt.sign(
          { _id: existingUser._id },
          process.env.SECRET_KEY
        )
        res.cookie('entryToken', token, {
          expires: new Date(Date.now() + 25892000000)
        })
        const { _id, name, email, role } = existingUser
        return res
          .status(200)
          .send({ token: token, user: { _id, email, name, role } })
      }
      return res.status(400).send({
        message: 'Email/Password are not matching.'
      })
    }
    return res.status(400).send({
      message: "User doesn't exist."
    })
  } catch (err) {
    return res.status(500).send({
      message: 'Internal Server Error'
    })
  }
})

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const _otp = Math.floor(100000 + Math.random() * 900000)

    console.log(`OTP is : ${_otp}`)

    let user = await Users.findOne({ email: req.body.email })

    console.log(user)

    if (!user) {
      res.send({ code: 500, message: 'User not Found' })
    }

    //Nodemailer
    let testAccount = await nodemailer.createTestAccount()

    let transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass // generated ethereal password
      }
    })

    let info = await transporter.sendMail({
      from: 'rajeshlakshmik@gmail.com', // sender address
      to: req.body.email, // list of receivers
      subject: 'OTP', // Subject line
      text: String(_otp), // plain text body
      html: '<b>Hello world?</b>' // html body
    })

    if (info.messageId) {
      Users.updateOne({ email: req.body.email }, { otp: _otp })
        .then(result => {
          res.send({ code: 200, message: 'OTP send', otp: _otp })
        })
        .catch(err => {
          res.send({ code: 500, message: 'Server error inside' })
        })
    } else {
      res.send({ code: 500, message: 'Server error' })
    }
  } catch (err) {
    res.status(500).send({
      message: 'Internal Server Error'
    })
  }
})

// Submit OTP
router.post('/submit-otp', async (req, res) => {
  try {
    const payload = req.body
    //New password hashing
    payload.hashedPassword = await bcrypt.hash(payload.password, 10)
    delete payload.password
    Users.findOne({ otp: payload.otp })
      .then(result => {
        //update password
        Users.updateOne(
          { email: result.email },
          { hashedPassword: payload.hashedPassword }
        )
          .then(result => {
            res.send({ code: 200, message: 'Password Updated.' })
          })
          .catch(err => {
            res.send({ code: 500, message: 'Server error' })
          })
      })
      .catch(error => {
        res.send({ code: 500, message: 'OTP is wrong' })
      })
  } catch (err) {
    res.status(500).send({
      message: 'Internal Server Error'
    })
  }
})

// signout
router.get('/signout', async (req, res) => {
  await res.clearCookie('entryToken')

  return res.status(200).send({
    message: 'Successfully Signed out! '
  })
})

module.exports = router