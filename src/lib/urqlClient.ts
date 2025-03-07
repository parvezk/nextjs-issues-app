import { createClient, cacheExchange, fetchExchange } from "urql";
/**
 * Configures the urql client for making GraphQL requests from the client side.
 * Sets up the GraphQL endpoint and caching strategies.
 */
const urqlClient = createClient({
  url:
    process.env.NEXT_PUBLIC_GRAPHQL_API_URL ||
    "http://localhost:3000/api/graphql", // Fallback for local development

  exchanges: [cacheExchange, fetchExchange],
});

export default urqlClient;
