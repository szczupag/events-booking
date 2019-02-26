const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

// functions below to populate the data without causing infinite loop
// because funcs are not executed as long as we don't request that specific value at the specific level
const events = async eventsIds => {
    try {
        const events = await Event.find({ _id: { $in: eventsIds } }) // mongodb special syntax
        return events.map(event => {
            return {
                ...event._doc,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            };
        });
    } catch (err) {
        throw err;
    };
};

const user = async userId => {
    try {
        const user = await User.findById(userId)
        return {
            ...user._doc,
            createdEvents: events.bind(this, user._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    };
};

module.exports = {
    events: async () => {
        try {
            const events = await Event.find() // eq ({title: 'A Test'}) or empty () for all results
            // .populate('creator') // mongoose method to populate any relations of nodes
            return events.map(event => {
                return {
                    ...event._doc, // _id: event._doc._id.toString() in case of value type error / or just _id: event.id
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator) // we use our own function 'user' instead of .populate() 
                };
            });
        } catch (err) {
            throw err;
        };
    },
    createEvent: async args => {
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: '5c75886d6691549f1bfb0cf9'
        });
        let createdEvent;
        try {
            const result = await event
                .save() // write data to database
            createdEvent = {
                ...result._doc, // + meta data
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };
            const creator = await User.findById('5c75886d6691549f1bfb0cf9');
            if (!creator) {
                throw new Error('User not found!');
            }
            creator.createdEvents.push(event);
            await creator.save();
            return createdEvent;

        } catch (err) {
            console.log(err);
            throw err;
        };
    },
    createUser: async args => {
        try {
            const exsistingUser = await User.findOne({ email: args.userInput.email })
            if (exsistingUser) {
                throw new Error('User exists already!');
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await user.save();
            return { ...result._doc, password: null }
        } catch (err) {
            throw err;
        };
    }
};