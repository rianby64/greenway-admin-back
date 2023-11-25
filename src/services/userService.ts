const bcrypt = require('bcrypt')
const tokenService = require('../services/tokenService')
const UserDto = require('../dtos/userDto')
const ApiError = require('../exceptions/api-error')

async function register(db: FirebaseFirestore.Firestore, email: any, password: any) {
	const usersRefs = await db.collection('users').get();
	const candidate = 
		usersRefs.docs.map((userRef) => {
					return {
						id: userRef.id,
						email: userRef.get('email'),
						password: userRef.get('password'),
						refreshToken: userRef.get('refreshToken'),
						accessToken: userRef.get('accessToken'),
						roleId: userRef.get('roleId')
					}
			}).find((el) => el.email === email)

	if (candidate) {
		throw ApiError.BadRequest(`User with email ${email} is already exists`);
	}

	const hashedPassword = await bcrypt.hash(password, 3);
	const user = {
		email,
		password: hashedPassword,
		roleId: 0,
	}

	const id = db.collection('users').doc().id;
	await db.collection('users').doc(id).create(user);

	const userDto = new UserDto(user, id)
	const tokens = tokenService.generateTokens({...userDto});
	await tokenService.saveToken(db, userDto.id, tokens.refreshToken)
	return {
		...tokens,
		user: userDto
	}
}

async function login(db: FirebaseFirestore.Firestore, email: any, password: any) {
	const usersRefs = await db.collection('users').get();
	const user = 
		usersRefs.docs.map((userRef) => {
					return {
						id: userRef.id,
						email: userRef.get('email'),
						password: userRef.get('password'),
						refreshToken: userRef.get('refreshToken'),
						accessToken: userRef.get('accessToken'),
						roleId: userRef.get('roleId')
					}
			}).find((el) => el.email === email)

	if (!user) {
		throw ApiError.BadRequest('User with such email was not found');
	}

	const isPassEquals = await bcrypt.compare(password, user.password);

	if (!isPassEquals) {
		throw ApiError.BadRequest('Incorrect password');
	}

	const userDto = new UserDto(user, user.id)
	const tokens = tokenService.generateTokens({...userDto});
	await tokenService.saveToken(db, userDto.id, tokens.refreshToken)
	return {
		...tokens,
		user: userDto
	}
}

async function logout(db: FirebaseFirestore.Firestore, refreshToken: any) {
	const token = await tokenService.removeToken(db, refreshToken);
	return token;
}

async function refresh(db: FirebaseFirestore.Firestore, refreshToken: any) {
	console.log(refreshToken)
	if(!refreshToken) {
		throw ApiError.UnauthorizedError();
	}


	const userData = tokenService.validateRefreshToken(refreshToken);
	const tokenFromDb = await tokenService.findToken(db, refreshToken);
	console.log(userData)
	console.log(tokenFromDb)
	if (!userData || !tokenFromDb) {
		throw ApiError.UnauthorizedError();
	}

	const user = await db.collection('users').doc(userData.id).get();
	const userDto = new UserDto(user, user.id)
	const tokens = tokenService.generateTokens({...userDto});
	await tokenService.saveToken(db, userDto.id, tokens.refreshToken)
	return {
		...tokens,
		user: userDto
	}
}

async function getUsers(db: FirebaseFirestore.Firestore) {
	const usersRefs = await db.collection('users').get();
	const users =
		usersRefs.docs.map((userRef) => {
			return {
				id: userRef.id,
				email: userRef.get('email'),
				password: userRef.get('password'),
				refreshToken: userRef.get('refreshToken'),
				accessToken: userRef.get('accessToken'),
				roleId: userRef.get('roleId')
			}
		});

	return users;
}

module.exports = {
	register,
	login,
	logout,
	refresh,
	getUsers
}