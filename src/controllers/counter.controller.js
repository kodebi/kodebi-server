import Counter from "../models/counter.model.js";

const mainCounterName = "mainBorrow";

const getBorrowCounter = async (_, res) => {
    try {
        let counter = await Counter.find({
            name: mainCounterName
        });
        if (counter == null) {
            counter = new Counter({
                name: mainCounterName,
                count: 0
            });
            await counter.save();
        }

        return res.status(201).json({
            Counter: counter.count
        });
    } catch (err) {
        return res.status(500).json({
            what: err.name
        });
    }
};

const incremenBorrowCounter = async (_, res, next) => {
    try {
        // const counter =
        await Counter.findOneAndUpdate(
            { name: mainCounterName },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );
        return next();
        // req.count = counter;
        // return res.status(201).json({
        //   count: counter
        // });
    } catch (err) {
        return res.status(500).json({
            what: err.name
        });
    }
};

export default {
    incremenBorrowCounter,
    getBorrowCounter
};
