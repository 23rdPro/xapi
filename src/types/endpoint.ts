export type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "head"
  | "options";

export type Param = {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required: boolean;
  schema: any; // dereferenced schema object
};

export type Body = {
  contentType: string; // e.g. 'application/json'
  schema: any;
};

export type Response = {
  status: string;
  contentType?: string;
  schema?: any;
};

export type Endpoint = {
  id: string;
  name: string;
  method: HttpMethod;
  path: string; // '/pets/{id}'
  summary?: string;
  description?: string;
  params: Param[]; // combined path + query + header
  requestBody?: Body;
  responses: Response[];
};

export const sampleEndpoints: Endpoint[] = [
  {
    id: "getPet",
    name: "getPet",
    method: "get",
    path: "/pet/{petId}",
    params: [
      {
        name: "petId",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
    ],
    responses: [
      {
        status: "200",
        contentType: "application/json",
        schema: { type: "object", properties: { id: { type: "string" } } },
      },
    ],
  },
  {
    id: "updatePet",
    name: "updatePet",
    method: "post",
    path: "/pet/{petId}",
    params: [
      {
        name: "petId",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
    ],
    requestBody: {
      contentType: "application/json",
      schema: {
        type: "object",
        properties: { name: { type: "string" } },
      },
    },
    responses: [
      {
        status: "200",
        contentType: "application/json",
        schema: {
          type: "object",
          properties: { success: { type: "boolean" } },
        },
      },
    ],
  },
];
