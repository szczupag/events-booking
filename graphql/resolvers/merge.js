const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');
const DataLoader = require('dataloader');

// fetching
const eventLoader = new DataLoader((eventIds)=>{
    return events(eventIds); 
});

const userLoader = new DataLoader((userIds)=>{
    return User.find({_id: {$in: userIds}});
});

// functions below to populate the data without causing infinite loop
// because funcs are not executed as long as we don't request that specific value at the specific level

const events = async eventIds => {
    try {
        const events = await Event.find({ _id: { $in: eventIds } }) // mongodb special syntax
        return events.map(event => {
            return transformEvent(event);
        });
    } catch (err) {
        throw err;
    };
};

const singleEvent = async eventId => {
    try {
        const event = await eventLoader.load(eventId.toString())
        return event;
    } catch (err) {
        throw err;
    }
}

const user = async userId => {
    try {
        const user = await userLoader.load(userId.toString())
        return {
            ...user._doc,
            _id: user.id,
            createdEvents: eventLoader.loadMany(user._doc.createdEvents)
        };
    } catch (err) {
        throw err;
    };
};

// optimizing events 'returns'
const transformEvent = event => {
    return {
        ...event._doc, 
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator) 
    };
};

const transformBooking = booking => {
    return {
        ...booking._doc,
        _id: booking.id,
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