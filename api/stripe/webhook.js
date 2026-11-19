module.exports = require("../../lib/server").handlers.stripeWebhook;
module.exports.config = { api: { bodyParser: false } }; // Stripe needs the raw body to check the signature
