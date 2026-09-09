import { findProductByIdFallback } from '../Backend/config/fallbackDb.js';

(async () => {
  try {
    const p = await findProductByIdFallback('sp01a99k');
    console.log(JSON.stringify(p, null, 2));
  } catch (e) {
    console.error('error', e.message || e);
  }
})();
