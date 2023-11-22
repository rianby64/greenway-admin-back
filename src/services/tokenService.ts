const jwt = require('jsonwebtoken');

const generateTokens = (payload: any) => {
	const accessToken = jwt.sign(payload, "jwt-access-secret-key", { expiresIn: '30m'});
	const refreshToken = jwt.sign(payload, "jwt-refresh-secret-key", { expiresIn: '30d'});

	return {
		accessToken,
		refreshToken
	}
}

async function saveToken(db: FirebaseFirestore.Firestore, userId: any, refreshToken: any) {
	const tokensRefs = await db.collection('tokens').get();
	const tokenId = 
	tokensRefs.docs.map((tokenRef) => {
						return {
							id: tokenRef.id,
							userId: tokenRef.get('user'),
						}
				}).find((el) => el.userId === userId)?.id;

	if (tokenId == undefined) {
		const id = db.collection('tokens').doc().id;
		const token = await db.collection('tokens').doc(id).create(
			{user: userId, refreshToken});
		return token;
	}

	const tokenRef = await db.collection('tokens').doc(tokenId);
	if (tokenId) {
		return tokenRef.update({refreshToken: refreshToken})
	}	
}

module.exports = {
	generateTokens,
	saveToken
}