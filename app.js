const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

const app = express();

app.use(bodyParser.json());

app.use(
    '/graphql',
    graphqlHttp({
        // ! - not null
        // [String!]! - not null list of not null strings
        // passoword in User is nullable because we DO NOT return password in any case
        schema: graphQlSchema,
        rootValue: graphQlResolvers,
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
