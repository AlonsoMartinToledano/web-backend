import { MongoClient, ObjectID } from "mongodb";
import { GraphQLServer } from "graphql-yoga";
import * as uuid from 'uuid'
import "babel-polyfill";


const usr = "alonso";
const pwd = "12345";
const url = "cluster0-uuiaf.gcp.mongodb.net/test";


/**
 * Connects to MongoDB Server and returns connected client
 * @param {string} usr MongoDB Server user
 * @param {string} pwd MongoDB Server pwd
 * @param {string} url MongoDB Server url
 */
const connectToDb = async function(usr, pwd, url) {
  const uri = `mongodb+srv://${usr}:${pwd}@${url}`;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  await client.connect();
  return client;
};

/**
 * Starts GraphQL server, with MongoDB Client in context Object
 * @param {client: MongoClinet} context The context for GraphQL Server -> MongoDB Client
 */
const runGraphQLServer = function(context) {
  const typeDefs = `
    type Query {
      getBills(userName: String!, token: ID!): [Bill!]
    }

    type Mutation{
      addUser(userName: String!, password: String!): User!
      login(userName: String!, password: String!): ID!
      logout(userName: String!, token: ID!): User!
      addBill(userName: String!, token: ID!, concept: String!, amount: Float!): Bill!
      removeUser(userName: String!, token: ID!): User!
    }

    type Bill {
      _id: ID!
      date: String!
      concept: String!
      amount: Float!
      user: User!
    }

    type User {
      _id: ID!
      token: ID
      userName: String!
      password: String!
    }
    `;

  const resolvers = {
    Query: {
      getBills: async (parent, args, ctx, info) => {
        const { userName, token } = args;
        const { client } = ctx;
        const db = client.db("billDatabase");
        const collectionUsers = db.collection("users");
        const collection = db.collection("bills");

        const findUser = await collectionUsers.findOne({ userName: userName });
        
        if(findUser.token === token){
          return await collection.find({user: findUser._id}).toArray();
        }
        else
          throw new Error("User is not logged in");
      }
    },
    Mutation: {
      addUser: async (parent, args, ctx, info) => {
        const { userName, password } = args;
        const { client } = ctx;

        const db = client.db("billDatabase");
        const collection = db.collection("users");
        
        const findUser = await collection.findOne({ userName: userName });
        if (!findUser){
          const result = await collection.insertOne({ userName, password });

          return {
            _id: result.ops[0]._id,
            userName,
            password
          }
        }
        else
          throw new Error("User already exist");
      },
      login: async (parent, args, ctx, info) => {
        const { userName, password } = args;
        const { client } = ctx;

        const db = client.db("billDatabase");
        const collection = db.collection("users");

        const findUser = await collection.findOne({ userName: userName });
        if(findUser.password === password){
          const token = uuid.v4();

          await collection.findOneAndUpdate({ userName: userName},
            {$set: {token: token}});
          
          return token;
        }
        else
          throw new Error("Wrong UserName or Password");
      },
      logout: async (parent, args, ctx, info) => {
        const { userName, token } = args;
        const { client } = ctx;

        const db = client.db("billDatabase");
        const collection = db.collection("users");

        const findUser = await collection.findOne({ userName: userName });
        if(findUser.token === token){
          await collection.findOneAndUpdate({ userName: userName},
            {$set: {token: null}});

          return await collection.findOne({ userName: userName });
        }
        else
          throw new Error("User is not logged in");
      },
      addBill: async (parent, args, ctx, info) => {
        const { userName, token, concept, amount } = args;
        const { client } = ctx;

        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const db = client.db("billDatabase");
        const collectionUsers = db.collection("users");
        const collection = db.collection("bills");

        const findUser = await collectionUsers.findOne({ userName: userName });
        const userID = findUser._id;
        if(findUser.token === token){
          const result = await collection.insertOne({ date: `${day}/${month}/${year}`, concept, amount, user: userID });

          return {
            _id: result.ops[0]._id,
            date,
            concept,
            amount,
            user: userID
          }
        }
        else
          throw new Error("User is not logged in");
      },
      removeUser: async (parent, args, ctx, info) => {
        const { userName, token } = args;
        const { client } = ctx;
        const db = client.db("billDatabase");
        const collectionUsers = db.collection("users");
        const collection = db.collection("bills");

        const findUser = await collectionUsers.findOne({ userName: userName });
        
        if(findUser.token === token){
          await collectionUsers.findOneAndDelete({ _id: ObjectID(findUser._id) });

          let findBills = await collection.findOne({ user: findUser._id });

          while(findBills){
            await collection.findOneAndDelete({ user: findUser._id });
            findBills = await collection.findOne({ user: findUser._id });
          }

          return findUser;
        }
        else
          throw new Error("User is not logged in");
      }
    },
    Bill: {
      user: async (parent, args, ctx, info) => {
        const { client } = ctx;
        const db = client.db("billDatabase");
        const collection = db.collection("users");
        const _id = parent.user;

        return await collection.findOne({ _id: ObjectID(_id) });
      }
    }
  };

  const server = new GraphQLServer({ typeDefs, resolvers, context });
  const options = {
    port: 8000
  };

  try {
    server.start(options, ({ port }) =>
      console.log(
        `Server started, listening on port ${port} for incoming requests.`
      )
    );
  } catch (e) {
    console.info(e);
    server.close();
  }
};

const runApp = async function() {
  const client = await connectToDb(usr, pwd, url);
  console.log("Connect to Mongo DB");
  try {
    runGraphQLServer({ client });
  } catch (e) {
    client.close();
  }
};

runApp();
