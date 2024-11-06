import { GlobalUser } from './models'

const userStore = new Map<string, GlobalUser>()
export function addUser(user: GlobalUser) {
	userStore.set(user.id, user)
}
export function getUser(userId: string): GlobalUser | null {
	return userStore.get(userId) ?? null
}
