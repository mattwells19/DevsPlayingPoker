/**
 * Simple cache that utilizes LRU strategy
 */
export class SimpleCache<T> {
	#cacheMap: Map<string, T>;
	#keySet: Set<string>;
	#limit: number;

	constructor(limit: number = 25) {
		this.#cacheMap = new Map();
		this.#keySet = new Set();
		this.#limit = limit;
	}

	set(key: string, value: T): void {
		// if we reached our limit, remove the oldest item before adding the new one
		if (!this.#keySet.has(key) && this.#keySet.size === this.#limit) {
			const oldestKey = Array.from(this.#keySet)[0];
			this.#keySet.delete(oldestKey);
			this.#cacheMap.delete(oldestKey);
		}

		this.#cacheMap.set(key, value);

		// since it was updated, move key to the end of the set
		if (this.#keySet.has(key)) {
			this.#keySet.delete(key);
		}

		this.#keySet.add(key);
	}

	get(key: string): T | null {
		// since it was accessed, move key to the end of the set
		if (this.#keySet.has(key)) {
			this.#keySet.delete(key);
			this.#keySet.add(key);
		}

		return this.#cacheMap.get(key) ?? null;
	}

	has(key: string): boolean {
		// since it was accessed, move key to the end of the set
		if (this.#keySet.has(key)) {
			this.#keySet.delete(key);
			this.#keySet.add(key);
		}

		return this.#keySet.has(key);
	}

	delete(key: string): void {
		this.#keySet.delete(key);
		this.#cacheMap.delete(key);
	}
}
