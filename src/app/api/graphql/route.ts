import { NextRequest, NextResponse } from "next/server";
import { buildSchema, graphql } from "graphql";
import { db } from "../../../lib/db";
import { users, issues } from "../../../lib/schema";
import { eq } from "drizzle-orm";
/**
 * defines the API route for handling GraphQL requests.
 * processes incoming GraphQL queries/mutations and interacts with the SQLite DB using Drizzle ORM
 */

// Define the GraphQL schema
const typeDefs = `
  type User {
      id: String!
      email: String!
      createdAt: String!
    }

  type Issue {
    id: String!
    name: String!
    userId: String!
    content: String!
    status: String!
    createdAt: String!
  }

  type Query {
    users: [User!]!
    issuesForUser(email: String!): [Issue!]!
  }

  type Mutation {
    updateIssueStatus(id: String!, status: String!): Issue!
  }
`;

const resolvers = {
  issuesForUser: async ({ email }: { email: string }) => {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (user.length === 0) {
      throw new Error("User not found");
    }

    return await db.select().from(issues).where(eq(issues.userId, user[0].id));
  },

  updateIssueStatus: async ({ id, status }: { id: string; status: string }) => {
    const [updatedIssue] = await db
      .update(issues)
      //@ts-ignore
      .set({ status })
      .where(eq(issues.id, id))
      .returning();
    if (!updatedIssue) {
      throw new Error("Failed to update issue status");
    }
    return updatedIssue;
  },

  users: async () => {
    return await db.select().from(users); // Fetch users from the database
  },
};

// Create the GraphQL schema
const schema = buildSchema(typeDefs);

export async function POST(req: NextRequest) {
  const { query, variables } = await req.json();
  console.log("POST API hit");
  const response = await graphql({
    schema,
    source: query,
    rootValue: resolvers,
    variableValues: variables,
  });

  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  return NextResponse.json(response, { headers });
}
