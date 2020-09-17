const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
	// Get token from header
	const token = req.header('x-auth-token');

	// Check if token is not present
	if (!token) {
		return res.status(401).json({ msg: 'No token, authorization denied' });
	}

	// if present: Verify token
	try {
		const decoded = jwt.verify(token, config.get('secret'));
		//console.log('decoded user:', decoded.user);
		req.user = decoded.user;
		next();
	} catch (err) {
		res.status(401).json({ msg: 'Token is not valid' });
	}
};
