import { assert, assertEquals, assertFalse } from "deno-asserts";
import SimpleCache from "../SimpleCache.ts";

Deno.test("LRU cache strategy works as expected", () => {
	const cache = new SimpleCache<number>(3);

	// [1, 2, 3]
	cache.set("1", 1);
	cache.set("2", 2);
	cache.set("3", 3);

	assert(cache.has("1"));
	assert(cache.has("2"));
	assert(cache.has("3"));

	// 1 and 2 get pushed out -> [3, 4, 5]
	cache.set("4", 4);
	cache.set("5", 5);

	assertFalse(cache.has("1"));
	assertFalse(cache.has("2"));

	assert(cache.has("3"));
	assert(cache.has("4"));
	assert(cache.has("5"));

	// 3 gets moved to the end and 4 gets pushed out -> [5, 3, 6]
	cache.set("3", 3);
	cache.set("6", 6);

	assertFalse(cache.has("4"));

	assert(cache.has("5"));
	assert(cache.has("3"));
	assert(cache.has("6"));

	// accessing 3 pushes it to the end -> [5, 6, 3]
	const val = cache.get("3");
	assertEquals(val, 3);

	// 5 gets pushed out -> [6, 3, 7]
	cache.set("7", 7);

	assertFalse(cache.has("5"));

	assert(cache.has("6"));
	assert(cache.has("3"));
	assert(cache.has("7"));
});

Deno.test("delete works", () => {
	const cache = new SimpleCache();

	cache.set("foo", "foo");
	cache.set("bar", "bar");

	assert(cache.has("foo"));
	assert(cache.has("bar"));

	cache.delete("foo");

	assertFalse(cache.has("foo"));
	assert(cache.has("bar"));
});
