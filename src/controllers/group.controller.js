const hasBookGroup = (req, res, next) => {
    if (req.auth && req.book.group) {
        const hasGroup = req.auth.groups.some(
            (group) => group === req.book.group
        );
        if (hasGroup) {
            return next();
        }
    }
    return res.status("403").json({
        error: "User is not authorized"
    });
};

const hasUserGroup = (req, res, next) => {
    if (req.auth && req.profile.group) {
        const hasGroup = req.auth.groups.some(
            (group) => group === req.profile.group
        );
        if (hasGroup) {
            return next();
        }
    }
    return res.status("403").json({
        error: "User is not authorized"
    });
};

const hasConvGroup = (req, res, next) => {
    if (req.auth && req.conv.group) {
        const hasGroup = req.auth.groups.some(
            (group) => group === req.conv.group
        );
        if (hasGroup) {
            return next();
        }
    }
    return res.status("403").json({
        error: "User is not authorized"
    });
};

export default {
    hasBookGroup,
    hasUserGroup,
    hasConvGroup
};
