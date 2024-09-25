import { createClient } from "redis";
import { Log } from "../utilities/log.js";

const pub = createClient({
    url: "redis://redis:6379", // Handled by docker
})

pub.on("error", error => {
    Log.e("redis", "An error has occured within the Redis client!")
    Log.e("redis", error)
})

pub.once("connect", () => {
    Log.d("redis", "Connection established!")
})

await pub.connect()

pub.configSet("notify-keyspace-events", "Ex");

const sub = pub.duplicate()


sub.on("error", error => {
    Log.e("redis", "An error has occured within the Redis client!")
    Log.e("redis", error)
})

await sub.connect()

export { pub, sub }