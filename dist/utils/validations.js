"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidCategory = exports.isValidStringInput = void 0;
const categories = [
    'GEOGRAFIJA',
    'ISTORIJA',
    'MUZIKA',
    'FILMOVI I SERIJE',
    'POZNATE LICNOSTI',
    'SPORT',
    'RAZNO'
];
const isValidStringInput = (str) => {
    let type = typeof str;
    if (type !== 'string') {
        return false;
    }
    if (str.length < 5) {
        return false;
    }
};
exports.isValidStringInput = isValidStringInput;
const isValidCategory = (req, res, next) => {
    if (!categories.includes(req.body.category)) {
        res.send({
            success: false,
            data: undefined,
            message: 'Kategorija nije pronadjena'
        });
    }
    next();
};
exports.isValidCategory = isValidCategory;
