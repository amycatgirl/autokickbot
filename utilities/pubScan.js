import { pub } from "../database/redis.js"

async function getKeys(pattern="*", count=10) {
    const results = [];
    const iteratorParams = {
        MATCH: pattern,
        COUNT: count
    }
    for await (const key of pub.scanIterator(iteratorParams)) {
        results.push(key);
    }
    return results;
}

export { getKeys }