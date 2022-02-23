import TotalBorrowedBooks from "../models/counter.model";

const mainCounterName = "main";

const getBorrowCounter = async (_, res) => {
    try {
        let counter = await TotalBorrowedBooks.find({
            counterName: mainCounterName
        });
        if (counter == null) {
            counter = new TotalBorrowedBooks({
                counterName: mainCounterName,
                totalBorrowedBooks: 0
            });
            await counter.save();
        }

        return res.status(201).json({
            totalBorrowedBooks: counter.totalBorrowedBooks
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
        await TotalBorrowedBooks.findOneAndUpdate(
            { counterName: mainCounterName },
            { $inc: { totalBorrowedBooks: 1 } },
            { new: true, upsert: true }
        );
        return next();
        // req.totalBorrowedBooks = counter;
        // return res.status(201).json({
        //   totalBorrowedBooks: counter
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
