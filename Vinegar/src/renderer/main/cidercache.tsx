const CiderCache = {
  async getCache(file) {
    let cache = await window.electronAPI.sendSync("get-cache", file);
    if (isJson(cache)) {
      cache = JSON.parse(cache);
      if (Object.keys(cache).length === 0) {
        cache = false;
      }
    } else {
      cache = false;
    }
    return cache;
  },
  async putCache(file, data) {
    console.log(`Caching ${file}`);
    window.electronAPI.invoke("put-cache", {
      file: file,
      data: JSON.stringify(data),
    });
    return true;
  },
};

export { CiderCache };
