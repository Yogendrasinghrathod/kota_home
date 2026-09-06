const memory = new Map();
const inflight = new Map();
const listeners = new Map();

export const cacheKeys = {
  me: () => "me",
  properties: () => "properties",
  feed: () => "feed",
  property: (id) => `property:${id}`,
  rooms: (id) => `rooms:${id}`,
  room: (propertyId, roomId) => `room:${propertyId}:${roomId}`,
  media: (id) => `media:${id}`,
  location: (id) => `location:${id}`,
  reviews: (id) => `reviews:${id}`,
  ownerReviews: () => "ownerReviews",
  amenities: () => "amenities",
  roomAmenities: (roomId) => `roomAmenities:${roomId}`,
};

export const peekCache = (key) => memory.get(key);

export const setCache = (key, data) => {
  memory.set(key, data);
};

export const cachedGet = (key, fetcher) => {
  if (memory.has(key)) {
    return Promise.resolve(memory.get(key));
  }

  if (inflight.has(key)) {
    return inflight.get(key);
  }

  const request = Promise.resolve()
    .then(fetcher)
    .then((data) => {
      memory.set(key, data);
      inflight.delete(key);
      return data;
    })
    .catch((error) => {
      inflight.delete(key);
      throw error;
    });

  inflight.set(key, request);
  return request;
};

export const subscribeCache = (key, listener) => {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key).add(listener);
  return () => listeners.get(key)?.delete(listener);
};

const notify = (key) => {
  listeners.get(key)?.forEach((listener) => listener());
};

export const invalidateCache = (...keys) => {
  for (const key of keys) {
    memory.delete(key);
    inflight.delete(key);
    notify(key);
  }
};

export const invalidatePrefix = (prefix) => {
  for (const key of [...memory.keys()]) {
    if (key === prefix || key.startsWith(prefix)) {
      memory.delete(key);
      notify(key);
    }
  }
  for (const key of [...inflight.keys()]) {
    if (key === prefix || key.startsWith(prefix)) {
      inflight.delete(key);
    }
  }
};

export const invalidateProperty = (propertyId) => {
  invalidateCache(
    cacheKeys.properties(),
    cacheKeys.feed(),
    cacheKeys.ownerReviews(),
    cacheKeys.property(propertyId),
    cacheKeys.rooms(propertyId),
    cacheKeys.media(propertyId),
    cacheKeys.location(propertyId),
    cacheKeys.reviews(propertyId)
  );
  invalidatePrefix(`room:${propertyId}:`);
};

export const clearCache = () => {
  memory.clear();
  inflight.clear();
};
