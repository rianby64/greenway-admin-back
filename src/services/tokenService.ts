const jwt = require('jsonwebtoken');

const generateTokens = (payload: any) => {
	//TODO: secret keys
	const accessToken = jwt.sign(payload, "jwt-access-secret-key", { expiresIn: '30s'});
	const refreshToken = jwt.sign(payload, "jwt-refresh-secret-key", { expiresIn: '30d'});

	return {
		accessToken,
		refreshToken
	}
}

const validateAccessToken = (token: any) => {
	try {
		const userData = jwt.verify(token, "jwt-access-secret-key");
		return userData;
	}
	catch (e) {
		return null;
	}
}

const validateRefreshToken = (token: any) => {
	try {
		const userData = jwt.verify(token, "jwt-refresh-secret-key");
		return userData;
	}
	catch (e) {
		return null;
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

async function removeToken(db: FirebaseFirestore.Firestore, refreshToken: any) {
	const tokensRefs = await db.collection('tokens').get();
	const tokenId = 
	tokensRefs.docs.map((tokenRef) => {
						return {
							id: tokenRef.id,
							refreshToken: tokenRef.get('refreshToken'),
						}
				}).find((el) => el.refreshToken === refreshToken)?.id;

	if (tokenId == undefined) {
		throw ApiError.BadRequest('Токен не найден')
	}

	const tokenData = await db.collection('tokens').doc(tokenId).delete();
	return tokenData
}

async function findToken(db: FirebaseFirestore.Firestore, refreshToken: any) {
	const tokensRefs = await db.collection('tokens').get();
	const tokenId =
		tokensRefs.docs.map((tokenRef) => {
						return {
							id: tokenRef.id,
							refreshToken: tokenRef.get('refreshToken'),
						}
				}).find((el) => el.refreshToken === refreshToken)?.id;

	if (tokenId == undefined) {
		return null;
	}

	const tokenData = await db.collection('tokens').doc(tokenId);
	return tokenData
}

module.exports = {
	generateTokens,
	saveToken,
	removeToken,
	validateAccessToken,
	validateRefreshToken,
	findToken
}