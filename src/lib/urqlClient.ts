import { createClient, cacheExchange, fetchExchange } from "urql";

const urqlClient = createClient({
  url:
    process.env.NEXT_PUBLIC_GRAPHQL_API_URL ||
    "http://localhost:3000/api/graphql", // Fallback for local development

  exchanges: [cacheExchange, fetchExchange],
});

export default urqlClient;
