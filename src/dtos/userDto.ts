module.exports = class UserDto {
	email: string;
	id: string;
	roleId: number;

	constructor(model: any, id: any) {
		this.email = model.email;
		this.roleId = model.roleId;
		this.id = id;
	}
}