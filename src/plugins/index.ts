import { generatePlugin } from "./generate";
import { graphqlPlugin } from "./graphql";
import { restPlugin } from "./rest";

export const plugins = [restPlugin, graphqlPlugin, generatePlugin];
