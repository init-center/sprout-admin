const throttle = (fn: (...args: unknown[]) => unknown, delay = 20) => {
  let lastTime = Date.now();
  return function (...args: unknown[]) {
    const now = Date.now();
    if (now - lastTime > delay) {
      lastTime = now;
      fn(...args);
    }
  };
};

export default throttle;
