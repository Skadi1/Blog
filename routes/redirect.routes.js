const { Router } = require('express')
const User = require('../models/User')
const Link = require('../models/Link')
const bcrypt = require('bcryptjs')
const config = require('config')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const AuthMiddleware = require('../middleware/auth.middleware')
const shortId = require('shortId')
const authMiddleware = require('../middleware/auth.middleware')
//*
let router = Router()
//*

router.get('/:code', async (req, res) => {
    try {

        const link = await Link.findOne({ code: req.params.code })

        if (link) {
            link.clicks += 1
            await link.save()
            res.redirect(link.from)
        }

        return res.status(500).json({ message: 'That link dont exists /t/' })

        // return res.status(200).json({ message: 'Link have been searched' })

    } catch (error) {
        res.status(500).json({ message: 'Error from router' })
    }
})

module.exports = router