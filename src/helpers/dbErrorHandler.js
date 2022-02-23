// format mongodb errors
const createError = (err, res) => {
    if (err.name === "ValidationError")
        return (err = handleValidationError(err, res));
    if (err.code && err.code === 11000)
        return (err = handleDuplicateKeyError(err, res));
    return res.status(500).json({
        what: err.name,
        error: err.message
    });
};

//handle email or username duplicates
const handleDuplicateKeyError = (err, res) => {
    const field = Object.keys(err.keyValue);
    const code = 409;
    const error = "Einen Benutzer mit dieser Mail Adresse gibt es bereits.";
    res.status(code).json({ error: error, field: field });
};

const handleValidationError = (err, res) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const fields = Object.values(err.errors).map((el) => el.path);
    const code = 400;
    if (errors.length > 1) {
        const formattedErrors = errors.join(" ");
        res.status(code).json({ error: formattedErrors, fields: fields });
    } else {
        res.status(code).json({ error: errors, fields: fields });
    }
};

export default { createError };
