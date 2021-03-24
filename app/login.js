const express = require('express')
const passport = require('passport')
const router = express.Router()



router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err)
        }
        if (!user) {
            return res.status(401).json('Usuario  e/ou senha não encontrados')
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err)
            }
            return res.status(200).json(req.user)
        })
    })(req, res, next)
    
})


module.exports = router
