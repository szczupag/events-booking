const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

const app = express();

const events = [];

app.use(bodyParser.json());


app.use(
    '/graphql',
    graphqlHttp({
        // ! - not null
        // [String!]! - not null list of not null strings
        schema: buildSchema(`
            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
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
                    date: new Date(args.eventInput.date)
                });
                // returning promise 
                return event
                    .save() // write data to database
                    .then(result => {
                        console.log(result);
                        return { ...result._doc }; // + meta data
                    })
                    .catch(err => {
                        console.log(err);
                        throw err;
                    })
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
