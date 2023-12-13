import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { prismaClient } from "./lib/db";

async function init() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Create GraphQL Server
  const gqlServer = new ApolloServer({
    typeDefs: `
        type Query {
          hello: String
          say: (name: String): String
        }
        type Mutation {
          createUser(firstName: String!, lastName: String!, email: String!, password: String!): Boolean
        }
    `, //Schema
    resolvers: {
      Query: {
        hello: () => `Heyy there, I'm a grahql server!`,
        say: (_, { name }: { name: string }) => `Hey ${name}, How are you?`,
      },
      Mutation: {
        createUser: async (
          _,
          {
            firstName,
            lastName,
            email,
            password,
          }: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
          }
        ) => {
          await prismaClient.user.create({
            data: {
              email,
              firstName,
              lastName,
              password,
              salt: "random_salt",
            },
          });
          return true;
        },
      },
    }, //Actual code that to be executed for queries and mutations
  });

  // Start the gql server
  await gqlServer.start();

  app.get("/", (req, res) => {
    res.json({ message: "Server is up and running!" });
  });
  app.use("/graphql", expressMiddleware(gqlServer));
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}
