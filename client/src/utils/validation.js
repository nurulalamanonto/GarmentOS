// Form values arrive as strings. These helpers check them before a record is saved.
export const isPositiveNumber = (value) => value !== '' && Number(value) > 0;
export const isNonNegativeNumber = (value) => value !== '' && Number(value) >= 0;
export const hasErrors = (errors) => Object.keys(errors).length > 0;
