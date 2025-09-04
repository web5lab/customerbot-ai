import { createSelector } from "@reduxjs/toolkit";

const globalSelector = (state) => state.global;
const ConfigSelector = (state) => state.global.uiConfig;

export const logedInSelector = createSelector(
  [globalSelector],
  (global) => global.logedIn
);

export const userSelector = createSelector(
  [globalSelector],
  (global) => global.profile
);

export const botsSelector = createSelector(
  [globalSelector],
  (global) => global.bots
);

export const activeBotSelector = createSelector(
  [globalSelector],
  (global) => global.activeBot
);

export const SessionsSelector = createSelector(
  [globalSelector],
  (global) => global.chatSessions
);

export const activeSessionsSelector = createSelector(
  [globalSelector],
  (global) => global.activeSession
);

export const messagesSelector = createSelector(
  [globalSelector],
  (global) => global.uiConfig.messages
);

export const inputSelector = createSelector(
  [ConfigSelector],
  (uiConfig) => uiConfig.input
);

export const isTypingSelector = createSelector(
  [ConfigSelector],
  (uiConfig) => uiConfig.isTyping
);

export const sessionIdSelector = createSelector(
  [ConfigSelector],
  (uiConfig) => uiConfig.sessionId
);

export const uiConfigSelector = createSelector(
  [ConfigSelector],
  (uiConfig) => uiConfig
);

export const teamsSelector = createSelector(
  [globalSelector],
  (global) => global.teams
);

export const currentTeamSelector = createSelector(
  [globalSelector],
  (global) => global.currentTeam
);

export const teamPermissionsSelector = createSelector(
  [globalSelector],
  (global) => global.teamPermissions
);