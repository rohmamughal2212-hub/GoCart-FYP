export const normalizeCategoryText = (value = "") => {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/&/g, " and ")
        .replace(/\s+/g, " ")
        .trim();
};

export const CATEGORY_ALIASES = {
    electronics: ["electronics"],
    sports: ["sports"],
    grocery: ["grocery"],
    meat: ["meat"],
    beauty: ["beauty", "beauty and care"],
    kitchen: ["kitchen", "home", "home and kitchen"],
    garments: ["garments", "fashion"],
    baby: ["baby", "baby items", "baby care"],
    computers: ["computers", "computer"],
    books: ["books"],
    toys: ["toys", "toys and games"],
};

export const categoryRoute = (value = "") => {
    const normalized = normalizeCategoryText(value);

    if (!normalized) return "";

    const found = Object.entries(CATEGORY_ALIASES).find(([key, aliases]) =>
        aliases.some((alias) => normalized === alias || normalized.includes(alias) || alias.includes(normalized))
        || key === normalized
    );

    if (found) return found[0];

    return normalized.replace(/\s+/g, "-");
};

export const categoryMatches = (productCategory, categoryKey) => {
    if (productCategory === undefined || productCategory === null || categoryKey === undefined || categoryKey === null) {
        return false;
    }

    const productValue = normalizeCategoryText(productCategory);
    const selectedValue = normalizeCategoryText(categoryKey);

    if (!productValue || !selectedValue) return false;

    if (productValue === selectedValue || productValue.includes(selectedValue) || selectedValue.includes(productValue)) {
        return true;
    }

    return categoryRoute(productCategory) === categoryRoute(categoryKey);
};
