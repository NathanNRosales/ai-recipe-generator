import { FormEvent, useState } from "react";
import { Loader, Placeholder } from "@aws-amplify/ui-react";
import "./App.css";
import { Amplify } from "aws-amplify";
import { GraphQLResult } from "aws-amplify/api";
import { generateClient } from "aws-amplify/api";
import { askBedrock } from "./graphql/queries"; // generated query
import "@aws-amplify/ui-react/styles.css";

// Configure Amplify
Amplify.configure({
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_APPSYNC_URL,
      region: import.meta.env.VITE_AWS_REGION,
      defaultAuthMode: "apiKey",
      apiKey: import.meta.env.VITE_APPSYNC_API_KEY,
    },
  },
});

console.log("Loaded VITE_APPSYNC_URL:", import.meta.env.VITE_APPSYNC_URL);
console.log("Loaded VITE_AWS_REGION:", import.meta.env.VITE_AWS_REGION);
console.log("Loaded VITE_APPSYNC_API_KEY:", import.meta.env.VITE_APPSYNC_API_KEY);



// Create GraphQL client
const client = generateClient({ authMode: "apiKey" });

function App() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const ingredients = formData.get("ingredients")?.toString() || "";

      const response = await client.graphql({
        query: askBedrock,
        variables: {
          ingredients: ingredients.split(",").map((item) => item.trim()),
        },
      });

      const { data, errors } = response as GraphQLResult<any>;
      if (!errors && data?.askBedrock) {
        setResult(data.askBedrock);
      } else {
        console.error("GraphQL errors:", errors);
        setResult("Error generating recipe. Please try again.");
      }
    } catch (e: any) {
      console.error("Error:", e);
      alert(`Error: ${e.message || JSON.stringify(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal
          <br />
          <span className="highlight">Recipe AI by Nathan Rosales</span>
        </h1>
        <p className="description">
          Simply type a few ingredients using the format ingredient1,
          ingredient2, etc., and Recipe AI will generate an all-new recipe on
          demand...
        </p>
      </div>
      <form onSubmit={onSubmit} className="form-container">
        <div className="search-container">
          <input
            type="text"
            className="wide-input"
            id="ingredients"
            name="ingredients"
            placeholder="Ingredient1, Ingredient2, Ingredient3,...etc"
          />
          <button type="submit" className="search-button">
            Generate
          </button>
        </div>
      </form>
      <div className="result-container">
        {loading ? (
          <div className="loader-container">
            <p>Loading...</p>
            <Loader size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
            <Placeholder size="large" />
          </div>
        ) : (
          result && <p className="result">{result}</p>
        )}
      </div>
    </div>
  );
}

export default App;
