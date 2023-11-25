import { firestore } from 'firebase-admin';
const userService = require('../services/userService')
const { validationResult } = require("express-validator")
const ApiError = require('../exceptions/api-error')

const db = firestore();

async function registration(req: any, res: any, next: any) {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return next(ApiError.BadRequest('Validation error', errors.array()))
		}

		const { email, password } = req.body;
		const userData = await userService.register(db, email, password)
		res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
		res.json(userData)
	}
	catch (e) {
		next(e);
	}
}

async function login(req: any, res: any, next: any) {
	try {
		const {email, password} = req.body;
		const userData = await userService.login(db, email, password)

		res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
		res.json(userData)
	}
	catch (e) {
		next(e);
	}
}

async function logout(req: any, res: any, next: any) {
	try {
		const {refreshToken} = req.cookies;
		const token = await userService.logout(db, refreshToken);
		res.clearCookie('refreshToken');
		return res.json(token);
	}
	catch (e) {
		next(e);
	}
}

async function refresh(req: any, res: any, next: any) {
	try {
		const {refreshToken} = req.cookies;
		const userData = await userService.refresh(db, refreshToken)
		res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
		res.json(userData)
	}
	catch (e) {
		next(e);
	}
}

async function getUsers(req: any, res: any, next: any) {
	try {
		const users = await userService.getUsers(db);
		res.json(users)
	}
	catch (e) {
		next(e);
	}
}


module.exports = {
	registration,
	login,
	logout,
	refresh,
	getUsers
}