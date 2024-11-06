import { NonEmptyList } from '../models'

export function partition<T, K extends T>(
	f: (x: T) => x is K,
	xs: T[],
): [K[], T[]] {
	const passed = []
	const rejected = []
	for (const x of xs) {
		if (f(x)) {
			passed.push(x)
		} else {
			rejected.push(x)
		}
	}
	return [passed, rejected]
}

export function isNotEmpty<T>(xs: T[]): xs is NonEmptyList<T> {
	return !!xs.length
}
