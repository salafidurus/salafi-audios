module.exports = {
  sd: {
    input: {
      target: "../../apps/api/openapi.json"
    },
    output: {
      mode: "split",
      target: "./generated/endpoints.ts",
      schemas: "./generated/schemas",
      client: "react-query",
      clean: true,
      prettier: true,
      override: {
        mutator: {
          path: "./src/http.ts",
          name: "httpClient"
        }
      }
    }
  }
};
