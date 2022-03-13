import { body, param, validationResult, matchedData } from "express-validator";

const userValidator = () => {
    return [
        body("email").isEmail().normalizeEmail(),
        body("password").isLength({ min: 6 }),
        body("name").isLength({ min: 2, max: 20 }).escape().stripLow()
    ];
};

const bookValidator = () => {
    return [
        body("ownerId").isMongoId().bail(),
        body("name").isLength({ min: 2, max: 20 }).escape(),
        body("author").isLength({ min: 2, max: 20 }).escape(),
        body("category").isLength({ min: 2, max: 20 }).escape(),
        body("language").isLength({ min: 2, max: 20 }).escape(),
        body("condition").isLength({ min: 2, max: 20 }).escape(),
        body("description").isLength({ min: 20 }).escape(),
        body("status").isLength({ min: 2, max: 20 }).escape()
    ];
};

const msgValidator = () => {
    return [
        body("message").isLength({ min: 2, max: 300 }).escape(),
        body("recieverId").isMongoId(),
        body("recieverName").isLength({ min: 2, max: 20 }).escape(),
        body("topic").isLength({ min: 2, max: 20 }).escape()
    ];
};

const mailValidator = () => {
    return [param("email").isEmail().normalizeEmail()];
};

const newPwValidator = () => {
    return [
        body("userId").isMongoId(),
        body("password").isLength({ min: 6 }),
        body("token").exists()
    ];
};

const activateValidator = () => {
    return [param("userId").isMongoId(), param("token").exists()];
};

const validate = (schemas) => {
    return async (req, res, next) => {
        await Promise.all(schemas.map((schema) => schema.run(req)));

        const result = validationResult(req);
        if (result.isEmpty()) {
            // req.matchedData = matchedData(req, locations: ["body"]);
            return next();
        }

        // const extractedErrors = [];
        // errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

        // return res.status(422).json({
        //     error: extractedErrors
        // });

        const errors = result.array();
        return res.status(422).json({
            errors
        });
    };
};

export {
    userValidator,
    bookValidator,
    msgValidator,
    mailValidator,
    newPwValidator,
    activateValidator,
    validate
};
