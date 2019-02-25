const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.use(
    '/graphql',
    graphqlHttp({
        // ! - not null
        // [String!]! - not null list of not null strings
        // passoword in User is nullable because we DO NOT return password in any case
        schema: buildSchema(`
            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            type User {
                _id: ID!
                email: String!
                password: String
            }

            input UserInput {
                email: String!
                password: String!
            }

            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            type RootQuery {
                events: [Event!]! 
            }

            type RootMutation {
                createEvent(eventInput: EventInput): Event
                createUser(userInput: UserInput): User
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        rootValue: {
            events: () => {
                // add 'return' because it's asynchronous 
                return Event
                    .find() // eq ({title: 'A Test'}) or empty () for all results
                    .then(events => {
                        return events.map(event => {
                            return { ...event._doc }; // _id: event._doc._id.toString() in case of value type error / or just _id: event.id
                        });
                    })
                    .catch(err => {
                        throw err;
                    })
            },
            createEvent: args => {
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date(args.eventInput.date),
                    creator: '5c74474780fa26953e68b35a'
                });
                let createdEvent;
                // returning promise 
                return event
                    .save() // write data to database
                    .then(result => {
                        createdEvent = { ...result._doc }; // + meta data
                        return User.findById('5c74474780fa26953e68b35a');
                    })
                    .then(user => {
                        if (!user) {
                            throw new Error('User not found!');
                        }
                        user.createdEvents.push(event);
                        return user.save();
                    })
                    .then(result => {
                        return createdEvent;
                    })
                    .catch(err => {
                        console.log(err);
                        throw err;
                    })
            },
            createUser: args => {
                return User
                    .findOne({ email: args.userInput.email }) // will always return undefined or object, so we don't need 'catch' block
                    .then(user => {
                        if (user) {
                            throw new Error('User exists already!');
                        }
                        return bcrypt.hash(args.userInput.password, 12);
                    })
                    .then(hashedPassword => {
                        const user = new User({
                            email: args.userInput.email,
                            password: hashedPassword
                        });
                        return user.save();
                    })
                    .then(result => {
                        return { ...result._doc, password: null }
                    })
                    .catch(err => {
                        throw err;
                    });
            }
        },
        graphiql: true
        // http://localhost:3000/graphql
    })
);

mongoose.connect(
    `mongodb+srv://${
    process.env.MONGO_USER
    }:${
    process.env.MONGO_PASSWORD
    }@cluster0-nv2f3.mongodb.net/${
    process.env.MONGO_DB
    }?retryWrites=true`)
    .then(() => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })
