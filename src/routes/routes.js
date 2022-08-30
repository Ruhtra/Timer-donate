const controller = require('../controller.js')
const router = require('express').Router()

const use = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
}

router.get('/', use(controller.main))
router.get('/config', use(controller.config))
// api
    router.get('/api/getDonates', use(controller.api.getDonates))
    router.get('/api/getpauses', use(controller.api.getPauses))
    router.get('/api/delDonates', use(controller.api.delDonates))
    router.get('/api/delPauses', use(controller.api.delPauses))
    // router.get('/api/updateConfig', use(controller.api.updateConfig))

module.exports = router