import { firestore } from 'firebase-admin';
const bcrypt = require('bcrypt')
const tokenService = require('../services/tokenService')
const UserDto = require('../dtos/userDto')

const db = firestore();

async function registration(req: any, res: any, next: any) {
	try {
		const email = req.body.email;
		const password = req.body.password;

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
			throw new Error(`Пользователь с почтовым адресом ${email} уже существует`);
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
		res.json(userDto)
	}
	catch (e) {
		console.log(e)
		res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
	}
}

async function login(req: any, res: any, next: any) {
	try {

	}
	catch (e) {
		res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
	}
}

async function logout(req: any, res: any, next: any) {
	try {

	}
	catch (e) {
		res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
	}
}

async function refresh(req: any, res: any, next: any) {
	try {

	}
	catch (e) {
		res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
	}
}

async function getUsers(req: any, res: any, next: any) {
	try {
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
				})

		res.json(users)
	}
	catch (e) {
		res.status(500).json(e); // THIS IS AN ERROR!!! MAKE SURE YOU WONT EXPOSE SENSTIVE INFO HERE
	}
}


module.exports = {
	registration,
	login,
	logout,
	refresh,
	getUsers
}