import { body, validationResult, matchedData } from "express-validator";

const userValidator = () => {
    return [
        body("email").isEmail().normalizeEmail(),
        body("password").isLength({ min: 6 }),
        body("name").isLength({ min: 2 }).escape().stripLow()
    ];
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

export { userValidator, validate };
