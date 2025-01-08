import { NextRequest, NextResponse } from "next/server";
import { buildSchema, graphql } from "graphql";
import { db } from "../../../lib/db";
import { users, issues } from "../../../lib/schema";
import { eq } from "drizzle-orm";

// Extend the typeDefs with a mutation for updating issue status
const typeDefs = `
  type Issue {
    id: String!
    name: String!
    userId: String!
    content: String!
    status: String!
    createdAt: String!
  }

  type Query {
    issuesForUser(email: String!): [Issue!]!
  }

  type Mutation {
    updateIssueStatus(id: String!, status: String!): Issue!
  }
`;

// Extend the resolvers with a mutation for updating issue status
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
      .set({ status })
      .where(eq(issues.id, id))
      .returning();
    if (!updatedIssue) {
      throw new Error("Failed to update issue status");
    }
    return updatedIssue;
  },
};

// Create the GraphQL schema
const schema = buildSchema(typeDefs);

export async function POST(req: NextRequest) {
  const { query, variables } = await req.json();
  console.log("POST API hit", query, variables);
  const response = await graphql({
    schema,
    source: query,
    rootValue: resolvers,
    variableValues: variables,
  });

  return NextResponse.json(response);
}
