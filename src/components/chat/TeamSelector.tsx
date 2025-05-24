"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette } from "lucide-react";

interface Team {
  name: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

interface TeamSelectorProps {
  onTeamChange: (teamCode: string, team: Team) => void;
  selectedTeam?: string;
}

export default function TeamSelector({ onTeamChange, selectedTeam }: TeamSelectorProps) {
  const [teams, setTeams] = useState<Record<string, Team>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/teams");
      const data = await response.json();
      setTeams(data.teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelect = (teamCode: string) => {
    const team = teams[teamCode];
    if (team) {
      onTeamChange(teamCode, team);
      // Save to localStorage
      localStorage.setItem("favoriteTeam", JSON.stringify({ code: teamCode, team }));
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-4">
          <div className="text-center">Loading teams...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Choose Your Team Theme
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select onValueChange={handleTeamSelect} value={selectedTeam}>
          <SelectTrigger>
            <SelectValue placeholder="Select your favorite NBA team" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(teams).map(([code, team]) => (
              <SelectItem key={code} value={code}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: team.colors.primary }}
                  />
                  {team.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTeam && teams[selectedTeam] && (
          <div className="mt-4 p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: teams[selectedTeam].colors.primary }}
              />
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: teams[selectedTeam].colors.secondary }}
              />
              <span className="font-medium">{teams[selectedTeam].name}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Theme applied! Your chat interface now uses {teams[selectedTeam].name} colors.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
