import { handlerPath } from "@libs/handlerResolver";

export const wsHandler = {
  handler: `${handlerPath(__dirname)}/handler.wsHandler`,
  events: [
    { websocket: "$connect" },
    { websocket: "$disconnect" },
    { websocket: "$default" },
  ],
};
