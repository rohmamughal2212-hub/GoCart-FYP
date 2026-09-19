import test from 'node:test';
import assert from 'node:assert/strict';
import { categoryMatches } from './Frontend/src/utils/categoryMatch.js';
import { loadLocalProductsWithIds } from './Backend/config/fallbackDb.js';

test('category aliases resolve the same public categories and product pages', () => {
    assert.equal(categoryMatches('Baby Items', 'baby'), true);
    assert.equal(categoryMatches('Beauty & Care', 'beauty'), true);
    assert.equal(categoryMatches('Home & Kitchen', 'kitchen'), true);
    assert.equal(categoryMatches('Fashion', 'garments'), true);
    assert.equal(categoryMatches('Electronics', 'electronics'), true);
});

test('local catalog keeps Beauty products available for the storefront and admin list', () => {
    const products = loadLocalProductsWithIds();
    const beautyProducts = products.filter((product) => categoryMatches(product.category, 'beauty'));
    assert.ok(beautyProducts.length > 0, 'Beauty products should be present in the local catalog');
});
