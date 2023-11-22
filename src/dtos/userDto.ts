module.exports = class UserDto {
	email: string;
	id: string;

	constructor(model: any, id: any) {
		this.email = model.email;
		this.id = id;
	}
}