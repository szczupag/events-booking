const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');

// functions below to populate the data without causing infinite loop
// because funcs are not executed as long as we don't request that specific value at the specific level

const events = async eventsIds => {
    try {
        const events = await Event.find({ _id: { $in: eventsIds } }) // mongodb special syntax
        return events.map(event => {
            return transformEvent(event);
        });
    } catch (err) {
        throw err;
    };
};

const singleEvent = async eventId => {
    try {
        const event = await Event.findById(eventId);
        return transformEvent(event);
    } catch (err) {
        throw err;
    }
}

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

// optimizing events 'returns'
const transformEvent = event => {
    return {
        ...event._doc, 
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator) 
    };
};

const transformBooking = booking => {
    return {
        ...booking._doc,
        user: user.bind(this, booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    };
};

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;

// exports.user = user;
// exports.events = events;
// exports.singleEvent = singleEvent;