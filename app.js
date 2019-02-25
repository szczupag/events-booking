const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(bodyParser.json());


app.use(
    '/graphql',
    graphqlHttp({
        // [String!]! - not null list of not null strings
        schema: buildSchema(`
            type RootQuery {
                events: [String!]! 
            }

            type RootMutation {
                createEvent(name: String): String
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        rootValue: {
            events: () => {
                return ['Eating', 'Sleeping', 'All-Night Coding']
            },
            createEvent: (args) => {
                const eventName = args.name;
                return eventName;
            }
        },
        graphiql: true
        // http://localhost:3000/graphql
    })
);

app.listen(3000);