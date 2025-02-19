const schema = `#graphql
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

export default schema;
