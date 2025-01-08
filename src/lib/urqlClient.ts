import { createClient, cacheExchange, fetchExchange } from "urql";

const urqlClient = createClient({
  url: "http://localhost:3000/api/graphql",
  exchanges: [cacheExchange, fetchExchange],
});

export default urqlClient;
