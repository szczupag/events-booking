const Event = require('../../models/event');
const { transformEvent } = require('./merge');

module.exports = {
    events: async () => {
        try {
            const events = await Event.find() // eq ({title: 'A Test'}) or empty () for all results
            // .populate('creator') // mongoose method to populate any relations of nodes
            return events.map(event => {
                return transformEvent(event);
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
            createdEvent = transformEvent(result);
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
    }
};