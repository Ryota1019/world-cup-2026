import teamsRaw from '../data/teams.json';
import groupsRaw from '../data/groups.json';
import matchesRaw from '../data/matches.json';
import playersRaw from '../data/players.json';
import type { Team, Group, Match, NotablePlayer } from './types';

export const teams = teamsRaw as Team[];
export const groups = groupsRaw as Group[];
export const matches = matchesRaw as Match[];
export const players = playersRaw as NotablePlayer[];

const teamsById = new Map(teams.map((t) => [t.id, t]));
export const getTeam = (id: string): Team | undefined => teamsById.get(id);
