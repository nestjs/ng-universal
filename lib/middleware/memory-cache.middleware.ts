import * as cache from 'memory-cache';

const memCache = new cache.Cache();

export const memoryCacheMiddleware = duration => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url;
    let cacheContent = memCache.get(key);
    if (cacheContent) {
      console.log('cached', key);
      res.send(cacheContent);
      return;
    } else {
      console.log('not cached', key);
      res.sendResponse = res.send;
      res.send = body => {
        memCache.put(key, body, duration * 1000);
        res.sendResponse(body);
      };
      next();
    }
  };
};
