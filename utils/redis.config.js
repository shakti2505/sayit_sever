// import {Redis} from 'ioredis';
// const redis = new Redis({
//     // url:process.env.REDIS_URL
//     host:process.env.REDIS_PORT,
//     port:process.env.REDIS_HOST,
// })

// export default redis;
import { createClient } from "redis";

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.connect().then((res)=>{
    console.log("redis client connected")
}).catch((err)=>{
    console.log('error in connection', err)
});

export default redisClient;
