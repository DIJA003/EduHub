/**
 * Lightweight structured request timing log (deployment-safe).
 */
const reqLogger =
  ({ slowMs = 800 } = {}) =>
  (req, res, next) => {
    const start = Date.now();
    const { method, originalUrl } = req;

    res.on("finish", () => {
      const ms = Date.now() - start;
      const line = `[${new Date().toISOString()}] ${method} ${originalUrl} ${res.statusCode} ${ms}ms`;
      const level =
        res.statusCode >= 500 ? "ERROR" : res.statusCode >= 400 ? "WARN" : "INFO";
      if (ms >= slowMs) {
        console.warn(`${line} (slow)`);
      } else if (level === "ERROR") {
        console.error(line);
      } else if (level === "WARN") {
        console.warn(line);
      } else {
        console.info(line);
      }
    });

    next();
  };

module.exports = { reqLogger };
